
Visual for tree structure use multilayer pie, base on echarts. With a specific color config scheme that leaf nodes use near color with it`s parent, the tree will be fill up to a full tree by the way add node for some node which has no nodes and layer deep is low. so hard to describe, now let us see the picture follow:

![image](https://github.com/chuixue/visPieTree/blob/master/demo/pieTreeDemo.jpg)



For Example:

>>var data = {name:"绩效", nodes:[
>>>>{name:"直达", value:20, nodes:[{name:"直达1", value:30}, {name:"直达2", value:70}]},
>>>>{name:"营销广告", value:10},
>>>>{name:"搜索引擎", value:60, nodes:[{name:"邮件", value:35, nodes:[{name:"企业邮件", value:15}]}, {name:"联盟", value:65}]}
>>>] 
>>};

                
Much code is not necessary in the com_tree file, extracted from other project, just no time to normalize the code. 
