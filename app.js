
// BUDGET CONTROLLER
var budgetController = (function(){
   
     var Expense = function(id, description, value){
         this.id = id;
         this.description = description;
         this.value = value;
         this.percentage = -1;
     };
     
    Expense.prototype.calculatePercentage = function( totalIncome){
        if(totalIncome > 0){
             this.percentage = Math.round(this.value /totalIncome * 100);
        }else{
            this.percentage = -1;
        }
       
    };
    
    Expense.prototype.getPercentage = 
function(){
        return this.percentage;
    }    
     var Income = function(id, description, value){
         this.id = id;
         this.description = description;
         this.value = value;
     };
    
     
    var calculateTotal = function(type){
        var sum = 0;
        
        data.allItems[type].forEach(function(cur){
           sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
       
    };
    
    return {
        addItem: function(type,des,val){
             var newItem, ID;
             
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else{
                ID = 0;
            }
             
            
             if(type === 'exp'){
                 newItem = new Expense(ID, des, val);
             }
            else if(type === 'inc'){
                newItem = new Income(ID,des, val);
            }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        deleteItem: function(type,id){
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });
    
            var index = ids.indexOf(id);
            
            console.log(index);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
        },
        
        calculateBudget: function(){
            
            // calculate toal income and expenses
                calculateTotal('exp');
                calculateTotal('inc');
            // calculate the budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            
            if(data.totals.inc > 0){
                data.percentage = Math.round(data.totals.exp/data.totals.inc * 100);
            }else{
                data.percentage = -1;
            }
        },
        calculatePercentage: function(){
            data.allItems.exp.forEach(function(current){
               current.calculatePercentage(data.totals.inc ); 
            });
        },
        
        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(current){
              return current.getPercentage();  
            });
            
            return allPerc;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function(){
            console.log(data);
        }
    };
})();






//UI CONTROLLER
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container:  '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    }
    return {
        getInput: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
           
        },
        
        addListItem: function(obj,type){
            var html, newHtml, element;
            
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                
                 html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
           
            else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', this.formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
            
            
        },
        deleteListItem:function(selectorID){
           
           var el = document.getElementById(selectorID);
               document.getElementById(selectorID).parentNode.removeChild(el);        
        },
        
        clearFields: function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach( function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
             obj.budget > 0 ? type = 'inc': type = 'exp'; 
            document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type);
              document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc,'inc');
              document.querySelector(DOMstrings.expensesLabel).textContent = this.formatNumber(obj.totalExp,'exp');
              
                if(obj.percentage > 0 ){
                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                }else{
                    document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            var nodeListForEach = function(list,callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent ='---';
                }
                
            });
        },
        
        formatNumber: function(num, type){
            var numSplit, int, dec;
            
            num = Math.abs(num);
            num = num.toFixed(2); 
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if(int.length > 3 ){
                int = int.substr(0, int.length-3) +','+ int.substr(int.length-3,3);
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ?  '-' :  '+') + ' '+ int +'.' +dec;
        },
        
        displayMonth: function(){
        var now,year,month ;
             
            now = new Date();
            year = now.getFullYear();
           month = now.getMonth(); document.querySelector(DOMstrings.dateLabel).textContent = year;
            
        },
        
        getDOMstrings: function(){
            return DOMstrings;
        }
        
    };
    
})();





//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICrtl){
    var setupEventListeners = function(){
           var DOM = UICrtl.getDOMstrings();

    document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
    
    document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }
    });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    var updateBudget = function(){
         // 1. Calculate the budget
            budgetCtrl.calculateBudget();
            
         // 2. Return the budget
        
            var budget = budgetCtrl.getBudget();
        
         // 3. Display the budget to the UI
            UICrtl.displayBudget(budget);
        
    };
    
    var updatePercentages = function(){
        // 1. Calculate the percentages
            budgetCtrl.calculatePercentage();
        // 2. Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentage();
    
        //3. Update the UI with the new percentages
        
       UICrtl.displayPercentages(percentages); 
    };
    
    var ctrlAddItem = function(){
         var input, newItem;
         // 1. Get the field input data
         input = UICrtl.getInput();
            //console.log(input);
        
        if( (input.description !== "") && !isNaN(input.value) && (input.value > 0)){
            // 2. Add the item to budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
         // 3. Add the item to the UI
         UICrtl.addListItem(newItem, input.type);
        UICrtl.clearFields();  
        
        // 4. Calculate and update budget
            updateBudget();
            
        // 5. Update percentages
            updatePercentages();
        }
         
        
        
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type , ID;     
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        
        if(itemID){
            
            // 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item form the data structure
            budgetCtrl.deleteItem(type, ID); 
            
            //2 .delete the item from the UI
            UICrtl.deleteListItem(itemID);
            
            //3. Update and show the new budget
            
            updateBudget();
            // 4. Update percentages
            updatePercentages();
        }
        
    };
    
    return {
        init: function(){
            console.log('Has started');
            UICrtl.displayMonth();
            UICrtl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

    
    
})(budgetController,UIController);


controller.init();