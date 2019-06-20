var baidu={
    editing:false,//当前是否正在编辑图形
}

function init(container) {
    // 百度地图API功能
    var map = new BMap.Map("allmap");
    map.centerAndZoom(new BMap.Point(114.078578, 22.788835), 12);
    map.addControl(new BMap.MapTypeControl());
    map.setCurrentCity("深圳");          // 设置地图显示的城市 此项是必须设置的
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

    var styleOptions = {
        strokeColor:"red",    //边线颜色。
        fillColor:"red",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.8,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    }
    //实例化鼠标绘制工具
    var drawing = new BMapLib.DrawingManager(map, {
        isOpen: false, //是否开启绘制模式
        //enableDrawingTool: true, //是否显示工具栏
        drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
            offset: new BMap.Size(5, 5), //偏离值
        },
        circleOptions: styleOptions, //圆的样式
        polylineOptions: styleOptions, //线的样式
        polygonOptions: styleOptions, //多边形的样式
        rectangleOptions: styleOptions //矩形的样式
    });

    //添加鼠标绘制工具监听事件，用于获取绘制结果
    drawing.addEventListener('overlaycomplete', function (e) {
        if(baidu.overlay!=undefined){
            map.removeOverlay(baidu.overlay)
        }
        baidu.overlay=e.overlay;
        baidu.editing=false;
    });

    //点击地图后将坐标信息保存到对象中
    map.addEventListener('click', function (e) {
        var geoc = new BMap.Geocoder();
        geoc.getLocation(e.point, function(rs){
            baidu.longitude=e.point.lng;
            baidu.latitude=e.point.lat;
            var addComp = rs.addressComponents;
            baidu.address=addComp.city +addComp.district + addComp.street + addComp.streetNumber;
        });
    })
    //鼠标右击事件
    map.addEventListener("rightclick",function(e){
        alert(e.point.lng+','+e.point.lat)
    });

    baidu.map=map;
    baidu.drawing=drawing;

}

//获取地图上多边形的点
baidu['getPolygon'] = function () {
    var pnt = [];
    if(baidu.overlay==undefined){
        return pnt;
    }
    for(var j = 0; j < baidu.overlay.length; j++) {
        var grid = overlay[j];
        var item = {}
        item.ord = j;
        item.lng = grid.lng;
        item.lat = grid.lat
        pnt.push(item)
    }
    return pnt;
};
//清除地图上的多边形
baidu['clearPolygon'] = function () {
    baidu.overlay=undefined;
    baidu.map.clearOverlays();
}

//编辑多边形
baidu['editPolygon'] = function (state) {
    baidu.drawing.close();
    if(state==false){
        baidu.overlay.disableEditing()
        baidu.editing=false;
    }else {
        baidu.overlay.enableEditing()
        baidu.editing=true;
    }
};
//画多边形
baidu['drawPolygon'] = function(){
    this.draw(BMAP_DRAWING_POLYGON)
}
//画长方形
baidu['drawRectangle'] = function(){
    this.draw(BMAP_DRAWING_RECTANGLE)
}
//画圆
baidu['drawCircle'] = function(){
    this.draw(BMAP_DRAWING_POLYLINE)
}
//画线
baidu['drawLine'] = function(){
    this.draw(BMAP_DRAWING_POLYLINE)
}

baidu['draw'] = function (type) {
    baidu.drawing.open();
    baidu.drawing.setDrawingMode(type);
};

//重新加载多边形
baidu['loadPolygon'] = function (item) {
    var pArray=[]
    for(i=0;j<item.length;i++){
        pArray.push(new BMap.Point(item[i].lng,item[i].lat))
    }
    var polygon = new BMap.Polygon(pArray, styleOptions);  //创建多边形
    this.clearPolygon();
    baidu.map.addOverlay(polygon);   //增加多边形
    baidu.overlay=polygon;
};
baidu['searchInMap'] = function (name) {
    baidu.map.clearOverlays();
    baidu.overlay=null;
    var local = new BMap.LocalSearch("深圳市",
        {renderOptions: {map: baidu.map,autoViewport: true},pageCapacity: 8});
    local.search(name);
}

baidu['locateTo'] = function (x, y,title='',info=undefined,goto=true,icon=undefined) {
    if (x == '' || x == undefined || y == '' || y == undefined) {
        return;
    }
    var posi = new BMap.Point(x,y);
    var marker = new BMap.Marker(posi);
    if (icon != undefined) {
        var new_icon=new BMap.Icon(icon, new BMap.Size(15, 15));
        marker.setIcon(new_icon);
    }
    if (info != undefined) {
        var opts = {
            width : 200,     // 信息窗口宽度
            height: 100,     // 信息窗口高度
            title : title  // 信息窗口标题
        };
        var infoWindow = new BMap.InfoWindow(info, opts);  // 创建信息窗口对象
        marker.addEventListener("mouseover", function(){
            baidu.map.openInfoWindow(infoWindow,posi); //开启信息窗口
        });
        marker.addEventListener("mouseout", function(){
            baidu.map.closeInfoWindow(posi);
        });
    }
    baidu.map.addOverlay(marker);
    if(goto){
        baidu.map.centerAndZoom(posi, 17);
    }
};


document.onkeydown=function(event){
    if(event.key=='Control' && baidu.overlay!=undefined && baidu.editing==false){
        baidu.editPolygon(true)
    }
}

document.onkeyup=function(event){
    if(event.key=='Control' && baidu.overlay!=undefined && baidu.editing==true){
        baidu.editPolygon(false)
    }
}

baidu['setAttrTo']=function (id,val) {
    $('#'+id).val(val);
}