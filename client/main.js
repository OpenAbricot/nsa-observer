var isDisplayed = true;
var isHidden = false;

var  transformWikiLinks = function(string) {
  var re = /(?:\[\[([A-Z0-9\-_]+)(?:\]\]))/g,
      match,
      str_res = string
      ;

  while (match = re.exec(string)) {
    if( match.length > 1){    
        str_res = str_res.replace(match[0],'<a class="item-show-link internal-link" rel="'+match[1]+'">'+match[1]+'</a>');
    }
  }
  return str_res;
}

var itemLinkShowList = function(event){
    var 
        element     = $(event.currentTarget),
        category    = element.attr("category"),
        family      = element.attr("family"),
        itemList    = [],
        search      = {},
        listName    = ""
    ;
    if( family ){
        search      = {category:category,family:family};
        listName    = category+"s: "+family;
    }else if (category){
        search      = {category:category};
        listName    = category+"s";
    }else{
        return;
    }
    Session.set("listName",listName)
    itemList    = Items.find(search,{sorted:{name:1}}).fetch();
    togglePanels(isDisplayed,["itemListIsVisible"]);
    Session.set("itemList",itemList)
    
}

var togglePanels = function (hideOrShow,panels){
    var iterator,
        state = hideOrShow || false,
        panels = panels || ["itemListIsVisible","itemShowIsVisible"];
        for( iterator = 0; iterator < panels.length; iterator++ ){
            Session.set(panels[iterator],state);
        }
}


if( ! (Session.get("itemList") instanceof Array) ){
    Session.set("itemList",[]);
}
if( ! (Session.get("currentItem") ) ){
    Session.set("currentItem",{});
}
if( ! (Session.get("itemListIsVisible") ) ){
    togglePanels(isHidden,["itemListIsVisible"]);
}
if( ! (Session.get("itemShowIsVisible") ) ){
    togglePanels(isHidden,["itemShowIsVisible"]);
}
if( ! (Session.get("listName") ) ){
    Session.set("listName","");
}
if( ! (Session.get("sliderRendered") ) ){
    Session.set("sliderRendered",false);
}
if( ! (Session.get("showNav") ) ){
    Session.set("showNav",false);
}



// page 
Template.page.itemListIsVisible = function(){
    return Session.get("itemListIsVisible");
}
Template.page.itemShowIsVisible = function(){
    return Session.get("itemShowIsVisible");
}
Template.page.rendered = function(){
    // esc
    $(document).keyup( function(e) {
        if (e.keyCode == 27) { 
            togglePanels(isHidden)  ;
        }   
    })
//    NodeList.drawGraph();
CategoryGraph.drawGraph();


}

// itemList
Template.itemList.element= function () {
    return Session.get("itemList") || [];
};

Template.itemList.listName= function () {
    return Session.get("listName");
};

Template.itemList.events({
    'click .panel-close':function(event){
        togglePanels(isHidden);
    }
});

// item
Template.item.events({
  'click a': function () {
    Session.set("currentItem",this);
    togglePanels(isDisplayed,["itemShowIsVisible"]);
  }
});

// itemShow

Template.itemShow.currentItem = function(){
    var item = Session.get("currentItem");
    item.relatedItems = $.map(item.relatedItems,function(x,y){return transformWikiLinks(x)})
    item.description = transformWikiLinks(item.description);
    return item;
}

Template.itemShow.events({
 
     'click .panel-close':function(event){
        togglePanels(isHidden,["itemShowIsVisible"]);
    },
    'click .internal-link':function(event){
        event.preventDefault();
        var name = $(event.currentTarget).attr("rel");
        if( name ){
            currentItem = Items.findOne({name:name});
            if( currentItem){
                Session.set("currentItem",currentItem);
            }
        }
        return false;
                
//        var href = $(event.currentTarget).attr("href"),
//            matches = /\[\[(.*)\]\]/.exec(href),
//            name = matches[1] || null,
//            currentItem
//            ;
//        if( name ){
//            currentItem = Items.findOne({name:name});
//        }
//        if( ! currentItem ){
//            return window.open(url, "http://wikipedia.org/en/"+name);
//        }
//        Session.set("currentItem",currentItem);
//        return false;
    },
    'click .family-link':itemLinkShowList,
    'click .category-link':itemLinkShowList,
});


// nav

Template.nav.showNav = function(){
    return Session.get("showNav");
}


Template.nav.events({
    'click a':itemLinkShowList,
    'click .menu-toggle':function(e){
        Session.set("showNav", ! Session.get("showNav"));
    },
    'keyup .search':function(e){
        var el = $(e.currentTarget),
            val = el.val(),
            itemList = [],
            regexp = new RegExp(val,'i');
       
       itemList = Items.find({name:regexp}).fetch();
       Session.set("listName","search:"+val);
       Session.set("itemList",itemList);
       togglePanels(isDisplayed,["itemListIsVisible"]);
       console.log(el, val,itemList,regexp)
    }
})


// Slider

Template.slider.events({
    'click a':itemLinkShowList
})

Template.slider.num = function(){
    return Items.find().count();
}

Template.slider.programs_num = function(){
    return Items.find({category:"program"}).count();
}
Template.slider.attacks_num = function(){
    return Items.find({category:"attack vector"}).count();
}
Template.slider.compartiments_num = function(){
    return Items.find({category:"compartiment"}).count();
}
Template.slider.undefineds_num = function(){
    return Items.find({category:"undefined"}).count();
}
Template.slider.rendered = function(){
    
   
        circleRadii = [{c:"grey",n:"undefined",q:Items.find({category:"undefined"}).count()},{c:"red",n:"programs",q:Items.find({category:"program"}).count()}, {c:"green",n:"attack vector",q:Items.find({category:"attack vector"}).count()}, {c:"blue",n:"compartiment",q:Items.find({category:"compartiment"}).count()}];
        var svgContainer = d3.select(".graph").append("svg")
                                            .attr("width", 600)
                                            .attr("height", 300);
        var circles = svgContainer.selectAll("circle")
                                  .data(circleRadii)
                                  .enter()
                                  .append("circle")
        var circleAttributes = circles
                               .attr("cx", "50%")
                               .attr("cy", "50%")
                               .attr("r", function (d) { return d.q; })
                               .style("fill", function (d) { return d.c});        
}