/* jshint latedef:false */
/* global $, Tremula, tremula */

'use strict';

$(document).ready(function(){
  setTimeout(function(){
    window.tremula = createTremula();
  },0);
});

//Basic example of API integration
//=================================
//DATA FUNCTIONS OF NOTE:
//tremula.refreshData(returned_set_array,dataAdapter)//replaces current data set with returned_set_array
//tremula.appendData(returned_set_array,dataAdapter)//appends current data set with returned_set_array
//tremula.insertData(returned_set_array,dataAdapter)//prepends current data set with returned_set_array
//=================================
window.loadPhotos = function (photos) {
  console.log('Loading ' + photos.length + ' photos');
  tremula.insertData(photos, function photoDataAdapter(data) {
    this.data = data;
    this.w = this.width = data.width;
    this.h = this.height = data.height;
    this.imgUrl = data.url;
    this.auxClassList = ''; //stamp each mapped item with map ID
    this.template = this.data.template || ('<img draggable="false" class="moneyShot" onload="imageLoaded(this)" src=""/>');
  });
};

function createTremula(){

  // .tremulaContainer must exist and have actual dimentionality
  // requires display:block with an explicitly defined H & W
  var $tremulaContainer = $('.tremulaContainer');

  //this creates a hook to a new Tremula instance
  var tremula = new Tremula();

  //Create a config object -- this is how most default behaivior is set.
  //see updateConfig(prop_val_object,refreshStreamFlag) method to change properties of a running instance
  var config = {

    //Size of the static axis in pixels
      //If your scroll axis is set to 'x' then this will be the normalized height of your content blocks.
      //If your scroll axis is set to 'y' then this will be the normalized width of your content blocks.
    itemConstraint      :200, //px

    //Margin in px added to each side of each content item
    itemMargins         :[10, 40],//x (left & right), y (top & bottom) in px

    //Display offset of static axis (static axis is the non-scrolling dimention)
    staticAxisOffset    :0,//px

    //Display offset of scroll axis (this is the amount of scrollable area added before the first content block)
    scrollAxisOffset    :20,//px

    //Sets the scroll axis 'x'|'y'.
    //NOTE: projections generally only work with one scroll axis
    //when changeing this value, make sure to use a compatible projection
    scrollAxis          :'x', //'x'|'y'

    //surfaceMap is the projection/3d-effect which will be used to display grid content
    //following is a list of built-in projections with their corresponding scroll direction
    //NOTE: Using a projection with an incompatible Grid or Grid-Direction will result in-not-so awesome results
    //----------------------
    // (x or y) xyPlain
    // (x) streamHorizontal
    // (y) pinterest
    // (x) mountain
    // (x) turntable
    // (x) enterTheDragon
    // (x) userProjection  <--
    //----------------------
    surfaceMap          :tremula.projections.mountain, //tremula.projections.streamHorizontal,

    //how many rows (or colums) to display.  note: this is zero based -- so a value of 0 means there will be one row/column
    staticAxisCount     :1,//zero based

    //the grid that will be used to project content
    //NOTE: Generally, this will stay the same and various surface map projections
    //will be used to create various 3d positioning effects
    defaultLayout       :tremula.layouts.xyPlain,

    //it does not look like this actually got implemented so, don't worry about it ;)
    itemPreloading      :true,

    //enables the item-level momentum envelope
    itemEasing          :true,

    //enables looping with the current seet of results
    isLooping           :false,

    //if item-level easing is enabled, it will use the following parameters
    //NOTE: this is experimental. This effect can make people queasy.
    itemEasingParams    :{
      touchCurve          :tremula.easings.easeOutCubic,
      swipeCurve          :tremula.easings.easeOutCubic,
      transitionCurve     :tremula.easings.easeOutElastic,
      easeTime            :500,
      springLimit         :40 //in px
    },

    //method called after each frame is painted. Passes internal parameter object.
    //see fn definition below
    onChangePub          : function() {},

    //content/stream data can optionally be passed in on init()
    data                : null,

    // lastContentBlock enables a persistant content block to exist at the end of the stream at all times.
    // Common use case is to target $('.lastContentItem') with a conditional loading spinner when API is churning.
    lastContentBlock     : {
      template :'<div class="lastContentItem"></div>',
      layoutType :'tremulaBlockItem',
      noScaling:true,
      w: 250,
      h: 250,
      isLastContentBlock:true
    },

    //dafault data adapter method which is called on each data item -- this is used if none is supplied during an import operation
    //enables easy adaptation of arbitrary API data formats -- see flickr example
    adapter             : function photoDataAdapter(data) {
      this.data = data;
      this.w = this.width = data.width;
      this.h = this.height = data.height;
      this.imgUrl = data.url;
      this.auxClassList = ''; //stamp each mapped item with map ID
      this.template = this.data.template || ('<img draggable="false" class="moneyShot" onload="imageLoaded(this)" src=""/>');
    }

  };

  //initalize the tremula instance with 3 parameters:
  //a DOM container, a config object, and a parent context
  tremula.init($tremulaContainer, config, this);

  //return the tremula hook
  return tremula;
}

