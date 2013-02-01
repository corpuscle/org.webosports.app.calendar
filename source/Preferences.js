//Create a settings manager.
//Using a singleton lets us just maintain one set of preferences and access it from other kinds.
enyo.singleton({
	name: "calendar.Preferences",
	kind: "Control",
    prefDefaults: {
        _kind                     : "org.webosports.calendarprefs:1",
        alarmSoundOn              : 1, // systemSound
        autoDefaultCalendarID     : 0,
        defaultAllDayEventReminder: "-P1D",
        defaultCalendarID         : 0,
        defaultEventDuration      : 60,
        defaultEventReminder      : "-PT15M",
        endTimeOfDay              : -111599994, // This is based on UTC
        firstlaunch: true,
        startOfWeek               : 1, // Sunday
        startTimeOfDay            : -226799992, // This is based on UTC
        userChangedStartOfWeek    : false
    },
	prefs: {},
	components: [
		{kind: "Signals", ondeviceready: "deviceready"}
	],
	//Sets multiple properties from the object by mixing them into the current preferences.
	set: function(object){
		var prefs = enyo.clone(this.prefs);
		//Mixin the new properties:
		enyo.mixin(prefs, object);
		//Put the values:
		this._put(prefs);
	},
	//Sets one item of the preferences, which is handy if you don't care to set multiple values.
	setOne: function(key, val){
		var setter = {};
		setter[key] = val;
		this.set(setter);
	},
	deviceready: function(){
		this.getPrefs();
	},
	getPrefs: function(){
		navigator.service.Request("palm://com.palm.db/", {
			"method": "find",
			"parameters": {
				"query": {
					"from": "org.webosports.calendarprefs:1"
				}
			},
			onSuccess: enyo.bind(this, "gotPrefs"),
			onFailure: function(inSender){
				console.log("F");
				console.log(JSON.stringify(inSender));
			}
		});
	},
	gotPrefs: function(inSender){
		var result = inSender && inSender.results;
		console.log(JSON.stringify(inSender));
		if(result.length === 0){
			this._first();
		}else{
			this.prefs = result[0];
			console.log("GOT PREFS!  ===   " + JSON.stringify(this.prefs));
		}
		
	    if (result.length > 1) {
			console.log("Too Many Results");
			return;
           var latestPrefIndex = 0;
           var latestPrefRev = results[0]._rev;
           var idsToDelete = [results[0]._id];
           //find the latest one
           for (var i = 1; i < resultsLength; i++) {
               var rev = results[i]._rev;
               idsToDelete.push(results[i]._id);
               if (rev > latestPrefRev) {
                   latestPrefIndex = i;
                   latestPrefRev = rev;
               }
           }
           this.prefs = results[latestPrefIndex];
           //this.plog("gotPrefs: spare prefs in the db!");
           idsToDelete.splice(latestPrefIndex, 1);

           //delete the spares
           this.databaseManager.deleteByIds(idsToDelete, this.deleteCB, this.deleteCB);
       }
	   //Send a signal out to everybody telling them that we've loaded the settings.
	   enyo.Signals.send("onSettingsLoad", this.prefs);
	},
	//First time setup:
	_first: function(){
		//Set prefs to the defaults:
		var prefs = enyo.clone(this.prefDefaults);
		this._put(prefs);
	},
	//Puts the actual settings object into the database and calls the signal so that all listening elements get the update.
	//This should only be called internally. The implementation of this is hidden a few layers up.
	_put: function(prefs){
		if(!prefs){
			return false;
		}
		//TODO: Use schema to validate preferences/preference values
		this.prefs = prefs;
		
		if(this.prefs._id){
			console.log("ID ALREADY EXISTS, MERGE");
			//The preferences already exist, call merge:
			navigator.service.Request("palm://com.palm.db/", {
				"method": "merge",
				"parameters": {
					"objects": [prefs]
				},
				onSuccess: enyo.bind(this, "savedPrefs"),
				onFailure: function(inSender){
					console.log("FAILED MERGE");
					console.log(JSON.stringify(inSender));
				}
			});
		}else{
			//First time inserting prefs:
			navigator.service.Request("palm://com.palm.db/", {
				"method": "put",
				"parameters": {
					"objects": [prefs]
				},
				onSuccess: enyo.bind(this, "savedPrefs"),
				onFailure: function(inSender){
					console.log("FAILED PUT");
					console.log(JSON.stringify(inSender));
				}
			});
		}
		
		//We could defer this until after the db8 process is complete, but there's no need to because we know what the settings are:
		enyo.Signals.send("onSettingsChange", this.prefs);
	},
	savedPrefs: function(inSender){
		if(inSender && inSender.returnValue){
			console.log("PREFERENCES SET!");
			this.prefs._id = inSender.results[0]._id || null;
			this.prefs._rev = inSender.results[0]._rev || null;
		}
	}
});

