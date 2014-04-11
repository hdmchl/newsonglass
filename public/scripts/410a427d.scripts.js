"use strict";angular.module("newsApp",["ngCookies","ngResource","ngSanitize","ngRoute"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl"}).when("/mynews",{templateUrl:"views/mynews.html",controller:"MynewsCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("newsApp").controller("MainCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("newsApp").controller("MynewsCtrl",["$scope","User","Preferences",function(a,b,c){a.alerts={},a.formData={},a.topics=[{id:0,label:"Technology"},{id:1,label:"Science"},{id:2,label:"Politics"}],a.preferences={freq:[]},b.getUser().then(function(b){a.user=b.user,c.getPreferences(b.user.id).then(function(b){a.preferences=b.data})}),a.submitForm=function(){a.alerts={};for(var b in a.preferences.freq)a.preferences.freq[b].selected=!1;a.preferences.freq[a.formData.freq].selected=!0,a.alerts=c.postPreferences(a.user.id,a.preferences)}}]),angular.module("newsApp").service("User",["$http",function(a){return{getUser:function(){return a.get("http://localhost:8080/user").then(function(a){return console.log("user",a),a.data})}}}]),angular.module("newsApp").service("Preferences",["$http",function(a){return{getPreferences:function(b){return a.get("http://localhost:8080/user/"+b+"/preferences").success(function(a){return console.log("GET results:",a),a.data})},postPreferences:function(b,c){return a.post("http://localhost:8080/user/"+b+"/preferences",c).success(function(a){return console.log("POST",c),console.log("POST response",a),a})}}}]);