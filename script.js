var calculator = document.getElementById('calculator');
var display = document.getElementById('display');

calculator.addEventListener('click', function(event){

	var target = event.target;
  var dataset = target.dataset;
  var value = dataset.value;
  var type = dataset.type;
  if (type) {
    calc.input(type, value);
    result = calc.output() ;
    display.innerHTML = result;
};
});




const STATE_LEFT_OPERAND = 'left_operand';
const STATE_RIGHT_OPERAND = 'right_operand';
const STATE_OPERATOR = 'operator';
const STATE_RESULT = 'result';


const TYPE_NUMBER = 'number';
const TYPE_ACTION = 'action';
const TYPE_OPERATOR = 'operator';


const OPERATOR_DIVISION = '/';
const OPERATOR_MULTIPLICATION = '*';
const OPERATOR_ADDITION = '+';
const OPERATOR_SUBTRACTION = '-';


const ACTION_CLEAR = 'AC';
const ACTION_RESULT = '=';



class BaseStrategy {
  constructor(delegate) {
    this.delegate = delegate;
  }
  onNumber(number) {
     this.delegate.acc.push(number);
  }
  onOperator(operator){}
  onResult(){}
  onClear() {
    this.delegate.reset();
  }
}

class LeftOperandStrategy extends BaseStrategy {
  onOperator(operator){
    let dg = this.delegate;
    dg.setOperator(operator);
    dg.setLeftOperand(dg.getAccumulator());
    dg.transition(STATE_OPERATOR);
  }
}
class OperatorStrategy  extends BaseStrategy {
  onNumber(number) {
    let dg = this.delegate;
    dg.clearAccumulator();
    dg.acc.push(number);
    dg.transition(STATE_RIGHT_OPERAND);
  }
  onOperator(operator) {
    this.delegate.setOperator(operator);
  }
  onResult() {
    let dg = this.delegate;
    dg.setRightOperand(dg.getAccumulator());
    dg.setAccumulator(dg.operation());
  }
}

class RightOperandStrategy  extends BaseStrategy {
  onOperator(operator) {
    let dg = this.delegate;
    let result = 0;
    dg.setRightOperand(dg.getAccumulator());
    result = dg.operation();
    dg.setAccumulator(result);
    dg.setLeftOperand(result);
    dg.setOperator(operator);
    dg.transition(STATE_OPERATOR);
  }
  onResult() {
    let dg = this.delegate;
    let result = 0;
    let rightOperand = 0;
    dg.setRightOperand(dg.getAccumulator());
    result = dg.operation();
    dg.setAccumulator(result);
    rightOperand = dg.getRightOperand();
    if (dg.getOperator() === OPERATOR_SUBTRACTION) {
      rightOperand = rightOperand * -1;
      dg.setOperator(OPERATOR_ADDITION);
    }
    if (dg.getOperator() === OPERATOR_DIVISION) {
      rightOperand = 1 / rightOperand;
      dg.setOperator(OPERATOR_MULTIPLICATION);
    }
    dg.setLeftOperand(rightOperand);
    dg.transition(STATE_RESULT);
  }
}

class ResultOperandStrategy  extends BaseStrategy {
  onOperator(operator) {
    let dg = this.delegate;
    dg.setOperator(operator);
    dg.setLeftOperand(dg.getAccumulator());
    dg.transition(STATE_OPERATOR);
  }
  onResult() {
    let dg = this.delegate;
    dg.setRightOperand(dg.getAccumulator());
    dg.setAccumulator(dg.operation());
		console.log(dg.getAccumulator);
  }
}

class Calculator {
  constructor() {
    this.init();
  }

  init() {
    this.acc = [];
    this.operator = null;
    this.leftOperand = 0;
    this.rightOperand = 0;
    this.state = null;
    this.strategy = null;
    this.transition(STATE_LEFT_OPERAND);
  }

  transition(state) {
    this.state = state;
    switch(state) {
      case STATE_LEFT_OPERAND:
        this.strategy = new LeftOperandStrategy(this);
        break;
      case STATE_RIGHT_OPERAND:
        this.strategy = new RightOperandStrategy(this);
        break;
      case STATE_OPERATOR:
        this.strategy = new OperatorStrategy(this);
        break;
      case STATE_RESULT:
        this.strategy = new ResultOperandStrategy(this);
        break;
    }
  }

  input(type, value) {
    switch(type) {
      case TYPE_NUMBER:
        this.strategy.onNumber(value);
        break;
      case TYPE_OPERATOR:
        this.strategy.onOperator(value);
        break;
      case TYPE_ACTION:
          if (value === ACTION_CLEAR){
            this.strategy.onClear();
          }
          if (value === ACTION_RESULT){
            this.strategy.onResult();
          }
        break;
    }
    this.logger();
  }

  operation () {
    let operator = this.operator;
    let result = 0;

    switch(operator) {
      case OPERATOR_DIVISION:
        result = this.leftOperand / this.rightOperand;
      break;
      case OPERATOR_MULTIPLICATION:
        result = this.leftOperand * this.rightOperand;
      break;
      case OPERATOR_ADDITION:
        result = this.leftOperand + this.rightOperand;
      break;
      case OPERATOR_SUBTRACTION:
        result = this.leftOperand - this.rightOperand;
      break;
    }
    return result;
  }

  setLeftOperand(value){
    this.leftOperand = value;
  }
  getLeftOperand(){
    return this.leftOperand;
  }
  setRightOperand(value){
    this.rightOperand = value;
  }
  getRightOperand(){
    return this.rightOperand;
  }
  setOperator(value){
    this.operator = value;
  }
  getOperator(){
    return this.operator;
  }

  setAccumulator(value){
    this.acc = Array.from(String(value));
  }

  getAccumulator(){
    return parseFloat(this.acc.join(''));
  }

  clearAccumulator(){
    this.acc = [];
  }

  reset() {
    this.init();
  }
  logger() {
    console.log({
      acc: this.acc,
      operator: this.operator,
      leftOperand: this.leftOperand,
      rightOperand: this.rightOperand,
      state: this.state,
			result: this.acc.
    })
  }

  output() {
    let result = 0;
    if (this.acc.length > 0) {
      result = this.acc.join('');
    }
    return result;
  }
}
var calc = new Calculator();
