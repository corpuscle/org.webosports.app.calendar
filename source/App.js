enyo.kind({
	name: "App",
	kind: "FittableRows",
	classes: "onyx",

	handlers: {
		onFirstUseDone: "doneFirstUse"
	},

	components: [
		{kind: "Signals",
		ondeviceready: "deviceready",
		onbackbutton: "handleBackGesture",
		onCoreNaviDragStart: "handleCoreNaviDragStart",
		onCoreNaviDrag: "handleCoreNaviDrag",
		onCoreNaviDragFinish: "handleCoreNaviDragFinish"},

		{kind: "Panels", draggable: false, name: "raw", fit: true, components: [
			//TODO: Splash?
			{name: "firstuse", kind: "FirstUse", fit: true},
			{name: "MainApp", kind: "MainApp", fit: true}
		]},

		{kind: "CoreNavi", fingerTracking: true}
	],

	doneFirstUse: function(){
		navigator.notification.alert(
		    'You are the winner!',  // message
		    function(){},         // callback
		    'Game Over',            // title
		    'Done'                  // buttonName
		);
		this.$.raw.setIndex(1);
	},

	create: function(){
		this.inherited(arguments);
		//TODO: First launch logic:
		if(true){
			//First Launch:
			this.$.raw.setIndex(0);
		}else{
			//Databased have already been set up.
			this.$.raw.setIndex(1);
		}
	}

});
