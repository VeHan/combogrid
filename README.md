# combogrid
带有combobox的数据表格


在我们的学校项目(学生管理系统)开发过程中用到了大量的数据表格，而且这些表格界面与功能基本类似，仅仅只有字段和请求地址不同而已，所以就想封装出一套表格的插件出来，这样能提高很大的开发效率。

我这里仅仅针对自己遇到的需求封装出了足够应用于该项目开发的功能。代码仅供参考和吐槽。有其他想法的汉子或妹子也可以与我讨论。

##效果图
这里主要演示功能，没有调整表格的样式，样式问题直接忽略。
![](http://ac-owahavgd.clouddn.com/3c5f13dcc124daee.gif)

##使用方法

1. 初始化
    
    ```
        //html
        <div id = 'd1'></div>

        //js
        /*
        初始化combogrid
        传递参数:$element:想要填充数据表格的区块元素
                 dataOpts:自定义参数:{
                    url:表格请求数据的url,
                    columns:列的参数:{
                        name:列名,
                        width:列宽占表格的百分比,
                        title:列的标题
                    },
                    onRowClick:function(rowData),一行的点击事件,参数是该行的数据
                 }
         */
        combogrid.combogrid($('#d1'), {
            url: "data.json",
            columns: [{
                name: 'grade',
                width: '20%',
                title: '年级'
            }, {
                name: 'major',
                width: '20%',
                title: '专业'
            }, {
                name: 'class',
                width: '20%',
                title: '班级'
            }, {
                name: 'name',
                width: '20%',
                title: '姓名'
            }, {
                name: 'stuNum',
                width: '20%',
                title: '学号'
            }],
            onRowClick: function(rowData) {
                alert(rowData.name);
            }
        });
    ```


2. 使用遮罩
当需要弹出自定义模式窗口的时候，我们不能让数据表格能够响应点击事件，并且需要一个阴影的遮罩，类似于这种情况。
![](http://ac-owahavgd.clouddn.com/660f0d973cf67971.gif)

    ```
    //js
    var isMask = fasle;
    function mask() {
       isMask = !isMask;

       /**
        * 打开/关闭遮罩
        * 参数：
        *   $element  被初始化为combogrid的区块元素对应的JQuery对象
        *   isMask    是否遮罩
        */
       combogrid.mask($('#d1'),isMask);
       if(isMask){
            $('button').html("不遮罩");
       }else{
            $('button').html("遮罩");
       }
    }
    ```