import { Component, h , State , Element, Prop, Watch, Listen } from "@stencil/core";
import {AV_API_KEY} from '../../global/global';

@Component({
   tag: 'ay-stock-price',
   styles: `
   :host{
    font-family: sans-serif;
    border: 2px solid rgba(248, 15, 248, 0.801) ;
    margin: 2rem;
    padding: 1rem;
    display: block;
    width: 20rem;
    max-width: 100%;
  }

  :host(.error){
    border-color: red;
  
  }
  
  form input {
    font: inherit;
    color: #3b013b;
    padding: 0.1rem 0.25rem;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  form input:focus,
  form button:focus{
    outline: none;
  }
  
  form button{
    padding: 0.25rem 0.5rem;
    border: 1px solid #3b013b;
    background: #3b013b;
    color: white;
    cursor: pointer;
  }
  
  form button:hover,
  form button:active{
    background: #750175;
    border-color: #750175;
  }

  form button:disabled{
    background: #ccc;
    border-color: #ccc;
    color: white;
    cursor: not-allowed;

  }
  .lds-ring {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 51px;
    height: 51px;
    margin: 6px;
    border: 6px solid #3b013b;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #3b013b transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  ` ,
   shadow: true
})
export class StockPrice{
  
  stockInput: HTMLInputElement;
   // initialStockSymbol: string;
  @Element() el: HTMLElement;
  
  @State() fetchedPrice: number ;
  @State() stockUserInput: string;
  @State() stockUserValid = false;
  @State() error: string;
  @State() loading =false;
  @Prop({reflect: true}) stockSymbol: string;

  @Watch('stockSymbol')
  stockSymbolChnaged(newValue: string,oldValue: string){
    if(newValue!==oldValue){
      this.stockUserInput = newValue;
      this.stockUserValid = true;
      this.fetchStockPrice(newValue);
    }
  }
  
  
  onUserInput(event: Event){
    this.stockUserInput = (event.target as HTMLInputElement).value
    if(this.stockUserInput.trim() !== ''){
      this.stockUserValid =true;
    }else{
      this.stockUserValid = false;
    }
  }


  onFetchStockPrice(event: Event){
     event.preventDefault();
    //const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;
    this.stockSymbol = this.stockInput.value;
   // this.fetchStockPrice(stockSymbol);
  }
  // componentWillLoad(){

  // }
  componentDidLoad(){
    console.log('componentDidLoad');
    if (this.stockSymbol) {
      // this.initialStockSymbol = this.stockSymbol;
      this.stockUserInput = this.stockSymbol;
      this.stockUserValid = true;
      this.fetchStockPrice(this.stockSymbol);
    }
  }
  // componentWillUpdate(){

  // }

  // componentDidUpdate(){
  //   console.log('componentDidUpdate');
  //   // if (this.stockSymbol !== this.initialStockSymbol) {
  //   //   this.initialStockSymbol = this.stockSymbol;
  //   //   this.fetchStockPrice(this.stockSymbol);
  //   // }
  // }
 // componentDidUnload(){

  //}

  @Listen('aySymbolsSelected',{target:'body'})
  onStockSymbolSelected(event: CustomEvent) {
    console.log(event.detail);
    if (event.detail && event.detail !== this.stockSymbol) {
      this.fetchStockPrice(event.detail);
      this.stockSymbol=event.detail;
    }
  }

  fetchStockPrice(stockSymbol: string){
    this.loading=true;
    fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${AV_API_KEY}`)
    .then(res => {
      return res.json();
     })
    .then(parsedRes => {
      if(!parsedRes['Global Quote']['05. price']){
        throw new Error('Invalid symbol!');
      }
      this.error=null;
      this.fetchedPrice = +parsedRes['Global Quote']['05. price'];
      this.loading=false;
    })
    .catch(err =>{
      this.error = err.message;
      this.fetchedPrice=null;
      this.loading=false;
    });
  }
  
  hostData() {
    return { class: this.error ? 'error': ''};
  }

  render(){
    let dataContent =  <p>Please enter a symbol</p>
     if(this.error){
       dataContent= <p>{this.error}</p>
     }
     if(this.fetchedPrice){
      dataContent =  <p>Price: ${this.fetchedPrice}</p>
     }
     if (this.loading) {
      dataContent = <ay-spinner></ay-spinner>;
    }
    return[
      <form onSubmit={this.onFetchStockPrice.bind(this)}>
        <input id="stock-symbol" ref={el => this.stockInput = el} value={this.stockUserInput}
        onInput={this.onUserInput.bind(this)}/>
        <button type="submit" disabled={!this.stockUserValid || this.loading}>Fetch</button>
      </form>,
      <div>
       {dataContent}
      </div>
    ];
  }
}
