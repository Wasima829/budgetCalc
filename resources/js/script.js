console.log("first app");

/* MVC framework
The Model component corresponds to all the data-related logic that the user works with. This can represent either the data that is being transferred between the View and Controller components or any other business logic-related data

The View component is used for all the UI logic of the application

Controllers act as an interface between Model and View components to process all the business logic and incoming requests, manipulate data using the Model component and interact with the Views to render the final output
*/

// budget controller (model)
var budgetController = (function (){
 //some code  
    var Expense = function (id, description, value){
        this.id= id;
        this.description=description;
        this.value= value;
        this.percentage =-1;
    };
    
    Expense.prototype.calcPercentage= function(totalIncome){
        
        if( totalIncome>0){        
        this.percentage= Math.floor((this.value /totalIncome)*100);
        } else{
            this.percentage=-1;
        }
        
    };
    
    Expense.prototype.getPercentage= function(){
        return this.percentage;
    }
    var Income = function (id, description, value){
        this.id= id;
        this.description=description;
        this.value= value;
    }
   
    var data ={
        allItems: {
        exp:[],
        inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
        
    }
    
    var calculateTotal= function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum+= cur.value;
        });
        data.totals[type]=sum;
            
    };
    
    return {
        additems: function (type,des, val){
        var newItem,ID;
            //create new id
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID=0;
            }
            
            //create new item based on inc or exp
            if (type=="exp"){
               newItem = new Expense (ID, des,val); 
            }
            else if (type=="inc"){
                newItem = new Income (ID, des,val); 
            }
            //push it to our data structure
            data.allItems[type].push(newItem);
            //return the object
            return newItem;
        } ,
        deleteItem: function(type,id){
                var ids, index;
            //id =3 we have to find the index and then delete it
           ids=  data.allItems[type].map(function (current){
                return current.id;
            });
            
            index= ids.indexOf(id);
            
            if (index !==-1){
                data.allItems[type].splice(index,1);
                // splice is used to remove element
            }
        },
        
        calcualteBudget(){
            //calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget ---> inocme- expense
            data.budget= data.totals.inc- data.totals.exp;
            //calculate the percentage of expense
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/ data.totals.inc)*100);
            } 
            else {
                data.percentage=-1;
            }
            
        },
        calculatePercentage:function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },
        getPercentage:function(){
            var allper= data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allper;
        },
        getBudget: function(){
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                toatlExp:data.totals.exp,
                percentage:data.percentage
                
            }
        },
        testing: function(){return data}
    }
})();

 

// UI controller (view)
var uiController= (function(){
 // some code
    var DOMstrings= {
        inputType:".add__type",
        inputDescription:".add__description",
        inputvalue:".add__value",
        inputBtn:'.add__btn',
        inputContainer:'.income__list',
        expenseContainer:'.expenses__list',
        budgetLable:'.budget__value',
        incomeLable:".budget__income--value",
        expenseLabel:".budget__expenses--value",
        percentageLable:".budget__expenses--percentage",
        container:".container",
        expensePercentageLabel:".item__percentage",
        dateLable:".budget__title--month"
        
    }
    
    var formatNumber= function(num,type){
            var numsplit,int, dec,type;
            num= Math.abs(num);
            num= num.toFixed(2);
            numsplit= num.split('.');
            int= numsplit[0];
            if(int.length>3){
               int=  int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
            }
            dec= numsplit[1];
            
            
            return (type==='exp'?'-':'+')+ ''+int+'.'+dec;
            
        }
     var nodelistForEach= function(list, callback){
                for(var i=0; i<list.length;i++){
                    callback(list[i],i);
                }
            };
     
     
    
    return {
        getinput: function (){
            return {
            type: document.querySelector(DOMstrings.inputType).value, // either or inc or exp
            description:document.querySelector(DOMstrings.inputDescription).value,
            value:parseFloat(document.querySelector(DOMstrings.inputvalue).value)
            };
        },
        addListItem:function(obj,type){
            var html,newhtml, element;
            // create html strig with placeholder text
            console.log("raja jii");
            if (type=='inc'){
                element= DOMstrings.inputContainer;
                
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type=='exp'){
                element= DOMstrings.expenseContainer;
                html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
           
          //replace placeholder text
            newhtml= html.replace("%id%", obj.id);
            newhtml= newhtml.replace("%description%", obj.description);
            newhtml= newhtml.replace("%value%",formatNumber(obj.value,type));
            //insert html dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
            
        },
        deleteListedItem:function (selectorID){
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearfields:function (){
            var fields;
           fields= document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputvalue);
            var fieldsArray= Array.prototype.slice.call(fields);
            fieldsArray.forEach(el=>el.value="");
            fieldsArray[0].focus();
        },
        displayBudget:function(obj){
            var type;
            obj.budget>0? type="inc":type="exp";
            document.querySelector(DOMstrings.budgetLable).textContent=formatNumber(obj.budget,type); document.querySelector(DOMstrings.incomeLable).textContent=formatNumber(obj.totalInc,'inc'); document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.toatlExp,'exp');
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLable).textContent=obj.percentage;
            }
            else{
                 document.querySelector(DOMstrings.percentageLable).textContent='--';
            }
        },
        displayPercentage:function(percentages){
            var fields= document.querySelectorAll(DOMstrings.expensePercentageLabel);
            
           
            
            nodelistForEach(fields, function(curr,index){
                            if(percentages[index]>0){
                   curr.textContent= percentages[index]+'%'; 
            } else{
                curr.textContent= '--'; 
            }             
            });
       },
        displayMonth:function (){
            var now,year,months,month;
            now= new Date();
             year= now.getFullYear();
            month=now.getMonth();
            console.log(year);
            months=['january','febraury','March','April','May','june','july','August','September','October','November','December']
            document.querySelector(DOMstrings.dateLable).textContent=months[month]+', '+year;
            
        },
        changeType:function(){
          var fields= document.querySelectorAll(
          DOMstrings.inputType+','+
              DOMstrings.inputDescription+','+
              DOMstrings.inputvalue);
          nodelistForEach(fields,function(cur){
              cur.classList.toggle('red-focus');
          });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
        ,
        
        getDomstring: function (){
            return DOMstrings;
        }
    }
    
})();

// Global App controller (controller)
var controller= (function(budgetCtrl,uiCtrl){
    //setup eventlistner    
    var setupeventListners = function () {
     var DOM= uiCtrl.getDomstring();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress',function (event){
        if (event.which===13 || event.keyCode===13){
            ctrlAddItem();
        }        
    });  
        document.querySelector(DOM.container).addEventListener("click",ctrDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',uiCtrl.changeType)
 
    }
    
    
   
    var updateBudget=function(){
    //1. calculate the budget
        budgetCtrl.calcualteBudget();
    //2. returnt the budget 
        var budget= budgetCtrl.getBudget();
    // 3. display the budget
        uiCtrl.displayBudget(budget);
    }
    
    var updatePercentage=function(){
        //calculate the percentage
        budgetCtrl.calculatePercentage();
        //read them from budget controller
        var percentage= budgetCtrl.getPercentage();
        // update the user interface with new percentage
        uiCtrl.displayPercentage(percentage);
    }
   var ctrlAddItem= function (){
       //1. get the input data
       var input, newItem,
       input= uiCtrl.getinput();
       
       if (input.description!=='' && !isNaN(input.value)&& input.value>0){
            //2. add the item to the budget controller
       newItem= budgetCtrl.additems(input.type,input.description,input.value);
       console.log(newItem);
     //3. add the item to user interface
       uiCtrl.addListItem(newItem,input.type);
       // clear the fields
       uiCtrl.clearfields();
    //calculate and update budget
       updateBudget();
           
        //calculate and update percentage
           updatePercentage();
     }         
       
       
   } ;
    
    var ctrDeleteItem= function(event){        
        var itemID,splitID,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;        
        if(itemID){
            splitID= itemID.split('-');
            type= splitID[0];
            ID= parseInt(splitID[1]);
            
            // delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            
            // delete from ui
            uiCtrl.deleteListedItem(itemID);
            //update and show new  budget
            updateBudget();
            // calculate and update percentage
            updatePercentage()
        }
        console.log(itemID);
    }
    
  return {
      init: function (){
          console.log("application started");
          uiCtrl.displayMonth();
          uiCtrl.displayBudget({
              budget:0,
              totalInc:0,
              toatlExp:0,
              percentage:-1});
          setupeventListners();
      }
  } 
    
})(budgetController,uiController); 

controller.init();