HTMLWidgets.widget({

  name: 'TextGridShiny',

  type: 'output',

  

  factory: function(el, width, height) {

    // TODO: define shared variables for this instance
    
  
     container = el;

  
     timeline = new vis.Timeline(container, [], [], {});

     var rangeP = function (range){
           
      if (range == null){

        range = 'range'

      } else {
        
        range

      }
      return range
    
    };

      function extended_split(str, separator, max) {
        var out = [],
          index = 0,
          next;
      
        while (!max || out.length < max - 1) {
          next = str.indexOf(separator, index);
          if (next === -1) {
            break;
          }
          out.push(str.substring(index, next));
          index = next + separator.length;
        }
        out.push(str.substring(index));
        return out;
      };
      


      
       var fetchRow = function(dataStr, searchStr, index) {

      
      var enddata = dataStr.lastIndexOf('"')
      
     

       var endIndex = dataStr.indexOf(searchStr, index) + 20;
      
        var word = dataStr.substring(index, endIndex);

       var result = word.split(searchStr, 2)[1].split(" ", 1)[0].trim();

    
      result = result.trim();
      
        if (result[0] == '"' && result[result.length - 1] == '"') {
          result = result.substring(1, result.length - 1);
        }
        result = result.trim();
      
        return [result, endIndex, enddata];
      }; 



      
      function toDateTime(secs) {
        var t = new Date(0,0,0,0,0,0,0);
    
        t = secs;
    
        t = new Date(0,0,0,0,0,0,t*1000);
       //year, month [, day [, hours [, minutes [, seconds [, milliseconds]]]]])
        return t;
      };
      
      function toSeconds(datetime) {
        var t = new Date(1970, 0, 1);
        
      };

    

    return {



      

      renderValue: function(x) {

      
      el.classList.add("button");
       
      var groupList = [];
      var itemList = [];
      var textgrid = {};
      var tgEnd = null;
      var tierEnd = null;
 

    
        
    
        


      var reader = x.flines; 
    
      var lines = reader.join(); 
         
         
         //toss header

      var INTERVAL_TIER = "interval_tier";
      var POINT_TIER = "point_tier";   
      var tierList = lines.split('item'); //with split I obtain an array
      var textgridHeader = tierList[0];


         var tgStart = textgridHeader.split("xmin = ", 2)[1].split(" ", 1)[0].trim();
         var tgEnd = textgridHeader.split("xmax = ", 2)[1].split(" ", 1)[0].trim();
          tierList.shift();

           // Process each tier individually
          var tierTxt = '';
          tierList.shift();

          var tierDict = {};
          var tierNameList = [];

          for (i = 0; i < tierList.length; i++) {
            tierTxt = tierList[i];

            // Get tier type
            var tierType = POINT_TIER;
            var searchWord = "points";
            if (tierTxt.indexOf('class = "IntervalTier"') > -1) {
              tierType = INTERVAL_TIER;
              searchWord = "intervals";
            }

            // Get tier meta-information
            var tmpArray = extended_split(tierTxt, searchWord, 2);
            var header = tmpArray[0];
            var tierData = tmpArray[1];
            var tierName = header.split("name = ", 2)[1].split(" ", 1)[0].trim();
            var tierStart = header.split("xmin = ", 2)[1].split(" ", 1)[0].trim();
            var tierEnd = header.split("xmax = ", 2)[1].split(" ", 1)[0].trim();


            // Get the tier entry list
            var entryList = [];
            var labelI = 0;
            if (tierType == INTERVAL_TIER) {
              tierType = "IntervalTier";
              while (true) {

         
                var startArray = fetchRow(tierData, "xmin = ", labelI);

                var timeStart = startArray[0];
           

           

                var endArray = fetchRow(tierData, "xmax = ", labelI);

                var timeEnd = endArray[0];
              

                var labelArray = fetchRow(tierData, "text = ", labelI);
                var label = labelArray[0];
       

              if (labelArray[0]!="") {

                entryList.push([parseFloat(timeStart), parseFloat(timeEnd), label]);

              }
          
             

                if (labelArray[1] >= startArray[2]) {

                  break;

               } 

               if (labelArray[1] <= startArray[2]) { 
               
                labelI = labelArray[1];
 
                 }
               
    

              var range = 'range';

              }
            } else {
              tierType = "TextTier"; // Name for point tier type??
              while (true) {
                var pointArray = fetchRow(tierData, "number = ", labelI);

                var timePoint = pointArray[0];
                var timePointI = pointArray[1];

                // Break condition here.  indexof loops around at the end of a file
                if (timePointI <= labelI) {
                  break;
                }

                var labelArray = fetchRow(tierData, "mark =", timePointI);
                var label = labelArray[0];
                var labelI = labelArray[1];

                label = label.trim();
                if (label === "") continue;

                entryList.push([parseFloat(timePoint), label]);
              }

              var range = 'point';

            }


    

            var tier = {
              'name': tierName,
              'type': tierType,
              'start': tierStart,
              'end': tierEnd,
              'entryList': entryList
            };


            tierDict[tierName] = tier;
            tierNameList.push(tierName);
          }

          var textgrid = {
            'tierNameList': tierNameList,
            'tierDict': tierDict,
            'minT': tgStart,
            'maxT': tgEnd,
          }; 
                
    


              var groupList = [];
              var itemList = [];
              var tierNameList = textgrid['tierNameList'];
              var tierDict = textgrid['tierDict'];
              var cumulativeID = 0;


               for (groupID = 0; groupID < tierNameList.length; groupID++) {

                var tierName = tierNameList[groupID];
                groupList.push({
                  id: groupID,
                  content: tierName
                });
      


                var entryListbis = tierDict[tierName]['entryList'];
      
                for (id = 0; id < entryListbis.length; id++) {
                  var entry = entryListbis[id];
                  itemList.push({
                    id: id + cumulativeID,
                    content: entry[2],
                    group: groupID,
                    start: toDateTime(entry[0]),
                    end: toDateTime(entry[1])
                  });
                }
                cumulativeID = cumulativeID + entryListbis.length;
              } 
      

              // Create a DataSet (allows two way data-binding)
        var groups = new vis.DataSet(groupList);
        var items = new vis.DataSet(itemList);

         // Configuration for the Timeline
        var options = {
          groupOrder: 'content',
          min: new Date(0,0,0,0,0,0,0),
          max: new Date(0,0,0,0,0,0,tgEnd*1000),
          end: new Date(0,0,0,0,0,0,tgEnd*1000),
          width: 'auto',
          margin: {
            item: 50, // before I have "50px" but the console gives a error
        },
          format: {
            minorLabels:  function(date, scale, step) {
              // step lead the distance, but divider lead the value
                var now = new Date(0,0,0,0,0,0,0);
                var ago = now - date;
                var divider;
                switch (scale) {
                  case 'millisecond':
                    divider = -2;
                    break;
                  default:
                    return new Date(date);
                } 
             //   return  (Math.round(ago * step / divider)) + " " + scale + "s ago" 
                return  (Math.round(ago * 2/divider))
              },
           //        },
            majorLabels: //function() {
        //     var now = new Date(0,0,0,0,0,0,0);

        //     scale = 100;

        //     step = 100;

        //     for (i = 0; i <= 5; i++) {
                 
        //           divider = new Date(0,0,0,0,0,0,i*100);

        //      //     return divider;
            
            
        //  //   return  (Math.round(ago * step / divider)) + " " + scale + "s ago" 
        //     return  (Math.round(divider));

        //     }
        //   }
           
           {
            millisecond:'SSS',
                   }
          },       
         timeAxis: {
              scale: 'millisecond', 
              step: 2,
             },
        //  hiddenDates: [{
        //       start: new Date(0,0,0,0,0,0,0),
        //       end: new Date(0,0,0,0,0,0,500),
        //      // repeat: 'SSS',
             
        //     }],
        //   template: function () {
             
        //       //  return  '<head><link rel="stylesheet" href="styles.css"></head>'
        //       //  + 'document.getElementsById("el").className += "btn btn-default btn-xs"' 
        //       //  + '<button id="zoomIn" class="btn btn-default btn-xs">+</button>'
        //       //  + '<button id="zoomOut" class="btn btn-default btn-xs">-</button>'
              
        // //       // '<style>'
        // //       // + '.vis-time-axis {color: white;'
        // //       // +  '}'
        // //       // + '</style>'
              
        //      ;
        //      },
          moveable: false, //get move the timeline on the axis
          stack: false, //two level
          showMinorLabels: true, //time
          showMajorLabels: false,
          showCurrentTime: false,
          align: 'left',
          selectable: true, // before I habe 'true' but the console gives me an error
          editable: {
            add: true,         // add new items by double tapping
            updateTime: true,  // drag items horizontally
            updateGroup: false, // drag items from one group to another
            remove: true,       // delete an item by tapping the delete button top right
            overrideItems: false  // allow these options to override item.editable
          },
          groupEditable: {
            add: true,
            remove: true,
            order: false,
          },
          onUpdate: function (item, callback) {

            popup.confirm(
              { 
                content: "Do you want to add a tier or edit the item's text ?",
                default_btns : {
                  ok : "Edit the item's text",
                  cancel : 'Cancel'
                },
                custom_btns : {
                  maybe : 'Add tier'
                }
              },
              function(config){
                var e = config.e;
          
                if(e.target.id == 'btn_extra_1_1'){

                  newGroupIdround = prompt("Add a tier's name :", newGroupIdround);
                  if (newGroupIdround != null) {
                    if (newGroupIdround == "") {
                      var newGroupId = Math.random();
                      var newGroupIdround = Math.round(newGroupId*10);
                     }
                      groups.add({id: newGroupId, content: 'Tier ' + newGroupIdround});
                      newGroupIds.push(newGroupId);
                  }
                  else {
                    callback(null); // cancel 
                  }             
           //  }
                } else if(config.proceed){
                  item.content = prompt("Edit the item's text:", item.content);
                  if (item.content != null) {
                    callback(item); // send back adjusted item
                  }
                  else {
                    callback(null); // cancel updating the item
                  }
                } else if (!config.proceed){
                
                }
              }
           );
       
         },
         type: rangeP(range),
      
          itemsAlwaysDraggable: {
            item: true,
            range: true,	
          },
          verticalScroll: false,
          zoomable: true,
          zoomKey: 'altKey',
          zoomMin: 1 * 1 * 1 * 1,
          zoomMax: 1 * 1 * 1 * 1 * 2000,
         
        };


       timeline.setOptions(options);
       timeline.setGroups(groups);
       timeline.setItems(items);
       


   

      },


     

      resize: function(width, height) {
 
        // TODO: code to re-render the widget with a new size
       
      },



    };
  }
});


