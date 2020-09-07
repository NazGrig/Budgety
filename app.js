//////////////////////////////////////////
// BUDGET CONTROLLER

let budgetControler = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePersentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }       
    };

    Expense.prototype.getPersentage  = function() {
        return this.percentage;
    };
    
    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
  };
    
    const calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(cur) {
        sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    const data = {
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
        addItem: function(type, des, val) {
            let newItem, ID;
        
        //Create new ID
        if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length-1].id + 1; 
        } else {
          ID = 0;
        }
        
        //Create new item based on 'inc or 'exp' type
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);    
        } else if (type === 'inc') {
          newItem = new Income(ID, des, val);  
        } 
        
        //Push it into our data structure
        data.allItems[type].push(newItem);
        
        //Return the new element
        return newItem;
    
    },

    deleteItem: function(type,id) {
        let ids, index;
         
        ids = data.allItems[type].map(function(current) {
            return current.id;
        });

        index = ids.indexOf(id);

        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    },
      
    
    calculateBudget: function() {
        
    //Calculate total income and expenses
    calculateTotal('exp');
    calculateTotal('inc');
          
    //Calculate the budget: income - expenses
    data.budget = data.totals.inc - data.totals.exp;
          
    //Calculate the percentage of income we spent
    if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    } else {
        data.percentage = -1;
    }
        
    },

    calculatePersentage: function() {

        data.allItems.exp.forEach(function(cur) {
            cur.calculatePersentage(data.totals.inc);
        });
    },
     
    getPercentages: function(){
        const allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPersentage();
        });
        return allPerc;
    },
    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
            
        };
    },

    testing: function() {
        console.log(data);
    }
  };
})();

//UI controler
let UIControler = (function(){
      let DOMstrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputButn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__title',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage'
      ,
      container: '.container',
      expensesPercentageLabel: '.item__percentage',
      dateLabel: '.budget__title--month'
    };

    const formatNumber = function(num, type) {
        let numSplit, int ,dec;
        
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

        
    };
    const nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
      getInput: function() {
        return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)    
        };   
      },
      
      addListItem: function(obj, type) {
        let html, newHtml, element;
        
        //Crate HTML string pcaceholser text
        if (type === 'inc') {   
            element = DOMstrings.incomeContainer;
            
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
            
            html = '<div class="item clearfix" id="exp-%id%""><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        };

        //Replace the placeholder text with some actual data
        newHtml = html.replace('%id%', obj.id);
        newHtml =newHtml.replace('%description%', obj.description);
        newHtml =newHtml.replace('%value%',formatNumber(obj.value, type));

        //Insert the HTML into the DOM 
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },
      
      delteListItem: function(selectorID) {
          const el = document.getElementById(selectorID);
          el.parentNode.removeChild(el);
      },

        clearFields: function() {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
          });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPersentages: function(percentages) {

            const fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

        
        nodeListForEach(fields, function(current, index) {
            if(percentages[index] > 0) {
                current.textContent = percentages[index] +'%';
            } else {
                current.textContent = '---';
            }
        });    
           
        },

        displayMonth: function() {
            let now,year, month , months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            const fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButn).classList.toggle('red');
        },

      getDOMstrings: function() {
          return DOMstrings;
      }
    };
})();


// GLOBAL APP CONTROLER
let controller = (function(budgetCtrl, UICtrl) {

      const setupEventListeners = function() {
          let DOM = UICtrl.getDOMstrings();
          document.querySelector(DOM.inputButn).addEventListener('click', ctrlAddItem);
          document.addEventListener('keypress', function(event) {
              if (event.keyCode === 13 || event.which === 13) {
                  ctrlAddItem();
              } 
         });

          document.querySelector(DOM.container).addEventListener('click', cntrlDeleteItem);
          document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

      };  
      
      

      const updateBudget  = function() {

          // 1. Calculate the budget 
          budgetCtrl.calculateBudget();
          
          // 2. Return the budget
          const budget = budgetCtrl.getBudget();

          // 3.Display the budget on the UI  
          UICtrl.displayBudget(budget);
      };

      const updatePercenentages = function() {
          // 1.Calculate percentage 
          budgetCtrl.calculatePersentage();
          // 2. read percentages from the budget controlerr 
          const percentage = budgetCtrl.getPercentages();

          // 3. Update the UI with new percentage
          UICtrl.displayPersentages(percentage);
      }
    
      const ctrlAddItem = function() {

            // 1. Get the field input data
            const input = UICtrl.getInput();

            if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

                // 2. Add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                // 3. Add the item to the UI 
                UICtrl.addListItem(newItem, input.type);

                // 4. Cleare the fields
                UICtrl.clearFields();

                // 5. Calculate and update budget
                updateBudget();

                // 6. Calculate and update percentagees
                updatePercenentages();
        }      
    };

      const cntrlDeleteItem =  function(event) {
            let itemID, splitID, type, ID;

            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

            if (itemID) {

                //ibc-1
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);

                // 1. Delete thw item from data strcucture 
                budgetCtrl.deleteItem(type, ID);
      
                // 2. Delete item from the UI
                UICtrl.delteListItem(itemID);

                // 3. Update and show the new budget
                updateBudget();

                 // 6. Calculate and update percentagees
                 updatePercenentages();
            }
      };

      return {
        init: function() {
          console.log('Aplication has started');
          UICtrl.displayMonth();
          UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
          });
          setupEventListeners();
      }
    };

})(budgetControler,UIControler);

controller.init();    


