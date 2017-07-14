var __icons = ['✎', '✕', '✛'];

/**
 * Created by Administrator on 2017/1/24.
 */

var ViewTree = function (){

    ViewTree.__common = [];
    ViewTree.__common_index = {};
    ViewTree.__treeview_data = {};       //save all data here.
    ViewTree.__common_style = -1;
    ViewTree.__common_system = [];
    ViewTree.__common_system_cache = {};
    ViewTree.__common_cache = {};        //其它普遍因素

    var IsExistNodeByName = function (data, name){
        if(data==undefined || !("nodes" in data))return false;
        for(var i=0; i<data.nodes.length; i++){
            if(data.nodes[i].name==name)return true;
        }
        return false;
    };
    /*
     list to tree
     input:    'children':[{'id':101, 'pid':1, 'name':'电影'}, {'id':102, 'pid':1, 'name':'购物'}, {'id':1011, 'pid':101, 'name':'日韩'}]
     output:    {"nodes":[{"id":101,"pid":1,"name":"电影","nodes":[{"id":1011,"pid":101,"name":"日韩"}]},{"id":102,"pid":1,"name":"购物"}]}
     */
    ViewTree.formatTree = function (children){
        var lsC = {},       //节点-孩子节点列表 索引
            lsR = {},   //节点-检测是否根节点 索引
            src = {};   //节点-源数据 索引
        children.forEach(function(d){
            src[d.id] = d;
            lsR[d.id] = 1;
        });
        children.forEach(function(d){
            if(d.pid in src){
                lsR[d.id] = 0;
                if(!(d.pid in lsC))lsC[d.pid] = [];
                lsC[d.pid].push(d.id);
            }
        });

        var tree = {'nodes':[]};
        for(var c in lsR){
            if(lsR[c]==0)continue;
            var node = src[c];
            node['text'] = node['name'];
            node['tags'] = __icons;
            node['href'] = "#node-" + node['id'];   //日后方便找到
            tree['nodes'].push(node);
            createTree(node, lsC, src);
        }
        return tree;
    };
    //建树过程 - 递归
    var createTree = function (parent, lsc, src){
        if(!(parent.id in lsc))return;
        lsc[parent.id].forEach(function(d){
            if(!('nodes' in parent))parent['nodes'] = [];
            var _node = src[d];
            _node['text'] = _node['name'];
            _node['tags'] = __icons;
            _node['href'] = "#node-" + _node['id'];   //日后方便找到
            parent['nodes'].push(_node);
            createTree(_node, lsc, src);
        });
    };

    //-------------------------------------------------------------------------------------------------------------
    //遍历树通用函数
    var traversal = function (node, callback, stop){
        callback(node);
        if(stop) return;
        if(!('nodes' in node))return;
        node['nodes'].forEach(function(d){
            traversal(d, callback, stop);
        });
    };

    /** 计算叶子结点权值 **/
    ViewTree.getLeafWeight = function (node){
        if(node.id=="root")node['value'] = 100;
        node.value = 1.0 * node.value / 100;
        if(!('nodes' in node))return;
        for(var i=0; i<node['nodes'].length; i++){
            node['nodes'][i].value *= node.value;
            ViewTree.getLeafWeight(node['nodes'][i]);
        }
    };

    //获取子树-根据id
    /** 暂未使用 **/
    this.getSubTreeById = function (tree, id){
        var data;
        traversal(tree, function(n){
            if('id' in n){
                if(n['id']==id) data = n;
            }
        });
        return data;
    };

    //获取树各节点子孙叶子节点数目信息·用于生成树形表格
    this.getTreeTableData = function(tree){
        traversal(tree, function(n){
            var c = getNodeLeafCount(n);
            n['leafCount'] = c;
        });
        var maxH = 0;
        traversal(tree, function(n){
            if(maxH<n['height'])maxH = n['height'];
        });
        //按层级遍历树
        var layers = [], temp = [tree];
        for(var i=0; i<maxH+1; i++) layers.push([]);
        while(temp.length>0){
            var n = temp.pop();
            layers[n['height']].push(n);
            if(!('nodes' in n)) continue;
            n['nodes'].forEach(function(d){
                temp.push(d);
            });
        }
        var leafs = [];
        layers.forEach(function(ly, i){
            ly.forEach(function(e, j){
                if(e.isLeaf==1)leafs.push(e.id);
            });
        });
        //traversal(tree, function(n){ if(n['isLeaf']==1) leafs.push(n); });

        tree['id'] = "root";
        return [layers, leafs];
    };

    //-------------------------------------------------------------------------------------------------------------
    //一般函数区
    //获取节点叶子节点个数
    var getNodeLeafCount = function (node){
        var count = [0];
        traversal(node, function(n){
            if(!('nodes' in n)) {
                n['isLeaf'] = 1;
                count[0]++;
            }
        });
        return count[0];
    };
    //获取树深度：含各节点的深度记录
    var _getTreeHeight = function (node, height){
        node['height'] = height[1];
        if(!('nodes' in node))return;
        height[1]++;
        if(height[1]>height[0]) height[0] = height[1];
        node['nodes'].forEach(function(d){
            _getTreeHeight(d, height);
        });
        height[1]--;
    };
    //获取树的深度-算法2
    var getTreeHeightEx = function(node){
        if(!('nodes' in node))return 1;
        var maxH = 0;
        node['nodes'].forEach(function(d){
            var h = getTreeHeightEx(d);
            if(h>maxH)maxH = h;
        });
        return maxH + 1;
    };

    ViewTree.getTreeHeight = function(tree){
        var height = [0, 0];
        _getTreeHeight(tree, height);
        //(getTreeHeightEx(tree));
        return height[0] + 1;
    };

    this.viewTreeByLayer = function (data, callbackView){
        var st = [data];
        while(1){
            var node = st.pop();
            if(node==undefined) break;
            callbackView(node);
            if("nodes" in node){
                node.nodes.forEach(function(n){
                    st.unshift(n);
                });
            }
        }
    };

    //*********暂时已弃用*********
    var _getNodeList = function (node, list){
        if('id' in node)list.push([node['id'], ('name' in node) ? node['name'] : "", node['value']]);
        if(!('nodes' in node))return;
        node['nodes'].forEach(function(d){
            _getNodeList(d, list);
        });
    };
    ViewTree.getNodeList = function (tree){
        var list = [];
        traversal(tree, function(node){
            if('id' in node)list.push([node['id'], ('name' in node) ? node['name'] : "", node['value']]);
        });
        //_getNodeList(tree, list);
        return list;
    };
    ViewTree.getNodeListEx = function (tree){
        var list = [];
        traversal(tree, function(node){
            if('id' in node){
                var line = {};
                for(var k in node) line[k] = node[k];
                list.push(line);
            }
        });
        return list;
    };
    /* 根据ID获取节点通用过程 */
    ViewTree.getNodeById = function (tree, nodeId){
        var N = tree, stop = false;
        traversal(tree, function(node){
            if(('id' in node) && nodeId==node.id){
                N = node;
                stop = true;
            }
        }, stop);
        return N;
    };
    /* 根据ID获取节点的父节点数据 */
    ViewTree.getParentIdByNode = function (tree, nodeId){
        var pid = 0, stop = false;
        traversal(tree, function(node){
            if(('id' in node) && (nodeId==node.id)){
                pid = node.pid;
                stop = true;
            }
        }, stop);
        return pid;
    };
    ViewTree.getParentByNode = function (tree, nodeId){
        var pid = ViewTree.getParentByNode(tree, nodeId);
        return (pid==0) ? tree : ViewTree.getNodeById(tree, pid);
    };
    //获取子孙节点
    //*注：此算法未经深入验证
    var _getChildrenListById = function (node, id, list, flag, callback){
        if(flag==true)callback(node);
        if(!('nodes' in node))return;
        node['nodes'].forEach(function(d){
            if(d['id']==id)
                _getChildrenListById(d, id, list, true, callback);
            else
                _getChildrenListById(d, id, list, flag, callback);
        });
    };
    ViewTree.getChildrenListById = function (tree, id){
        var list = [];
        _getChildrenListById(tree, id, list, false, function(node){ list.push(node['id']); });
        return list;
    };
    ViewTree.getChildrenListByIdExOld = function (tree, id){
        var list = [];
        _getChildrenListById(tree, id, list, false, function(node){ list.push(node); });
        return list;
    };
    ViewTree.getChildrenListByIdEx = function (tree, id){
        var node = ViewTree.getNodeById(tree, id);
        if(!('nodes' in node))return [];
        return node['nodes'].map(function(d){ return d; });
    };

    //删除节点·含子树
    //*此算法有瑕疵，暂无时间修改
    //*删除元素后，迭代器索引可能越界
    var removeNodeById = function (node, id){
        if(!('nodes' in node))return;
        for(var i=0; i<node['nodes'].length; i++){
            if(node['nodes'][i]['id']==id){
                node['nodes'].splice(i, 1);
                if(node['nodes'].length==0)delete node['nodes'];
                return;
            }
            removeNodeById(node['nodes'][i], id);
        }
    };








};//    End Class






function DrawPieTree(dt, id){
    var data = dt || {name:"绩效", nodes:[{name:"直达", value:20, nodes:[{name:"直达1", value:30}, {name:"直达2", value:70}]},
            {name:"营销广告", value:10},
            {name:"搜索引擎", value:60, nodes:[{name:"邮件", value:35, nodes:[{name:"企业邮件", value:15}]}, {name:"联盟", value:65}]}] };

    var colorCfg = ["#87CEFA", "#58C1C0", "#23BAD7", "#F7A35C", "#8085E9", "#10B4E8", "#07C25B",
        "#89F588", "#12AA9E", "#9C99FF", "#4F81BE", "#279F3E", "#FD5F60", "#F7DDDC",
        "#4272C6", "#FF850A", "#8DAE00", "#67C454", "#F25C82", "#DC70D6"];
    var colorNull = "#ddd";

    // 获取一个相似颜色， 十六进制，layer表示哪个颜色做改动
    function getColorNear(clr, layer){
        if(layer==undefined) layer = 0;
        layer = layer % 3;
        var r = clr.substr(1, 2), g = clr.substr(3, 2), b = clr.substr(5, 2);
        var c = [r, g, b], number = parseInt(c[layer], 16), f = [-1, 1][parseInt(Math.random() * 2)],
            offset = parseInt(Math.random() * 32) * f;
        var S = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        number = (number + offset) % 256;
        c[layer] = S[parseInt(number / 16)] + S[parseInt(number % 16)];
        return "#" + c[0] + c[1] + c[2];
    }

    var T = new ViewTree(), height = ViewTree.getTreeHeight(data), rCenter = 0;
    var series = [], R = 85 / (height - 1);
    for(var i = 1; i< height; i++) series.push({
        data:[],
        type:"pie",
        radius: [(R * (i - 1) + rCenter) + "%", (R * i + rCenter) + '%'],
        label: {
            normal: {
                position: 'inner'
            }
        },
        labelLine: {
            normal: {
                show: false
            }
        }
    });

    T.viewTreeByLayer(data, function(n){
        if("nodes" in n){   // 检查是否配满
            var sumC = n["nodes"].reduce(function(a, b){ a += b.value; return a; }, 0);
            if(sumC<100)n["nodes"].push({name:"empty", value:100 - sumC, height:n.height + 1 });
        }else{
            if(n.height > 0 && n.height < (height-1)){  // 空子孙占位
                n["nodes"] = [{name: n.name, value: 100, flag:'full', height:n.height + 1 }];
            }
        }
    });

    // 一级节点配色
    data['nodes'].forEach(function(d, i){
        d['color'] = (d.name==="empty") ? colorNull : colorCfg[i % 20];
    });

    // 节点配色
    T.viewTreeByLayer(data, function(n){
        if(n.height==0 || !("nodes" in n))return;
        n.nodes.forEach(function(c){
            if(c.name=='empty') c['color'] = "#ddd";             //空白色
            else if(c.flag=='full') c['color'] = n.color;       //子级占位同色
            else c['color'] = getColorNear(n.color, n.height);  //子孙近似色
        });
    });


    data['id'] = "root";
    ViewTree.getLeafWeight(data);       // 获取各级最终比例

    T.viewTreeByLayer(data, function(node){
        if(node.height != 0) series[node.height - 1].data.push({
            name: node.name==="empty" ? "空" : node.name,
            value: (node.value * 100).toFixed(2),
            itemStyle: {normal:{color:node.color }
            }});
    });

    var option = {
        tooltip: {
            trigger: 'item',
            formatter: function(p){ return p.name + "<br>所占比例：" + p.value; }
        },
        series: series
    };

    Init3(option, id);
}


function Init3(option, id){
    var myChart = echarts.init(document.getElementById(id));
    myChart.setOption(option);
    return myChart;
}













