import { Component , h, State,Event,EventEmitter} from '@stencil/core'
import {AV_API_KEY} from '../../global/global';

@Component({
  tag:'ay-stock-finder',
  styles:`
  :host {
    font-family: sans-serif;
    border: 2px solid #3b013b;
    margin: 2rem;
    padding: 1rem;
    display: block;
    width: 20rem;
    max-width: 100%;
  }
 
  
  form input {
    font: inherit;
    color: #3b013b;
    padding: 0.1rem 0.25rem;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  form input:focus,
  form button:focus {
    outline: none;
  }
  
  form button {
    font: inherit;
    padding: 0.25rem 0.5rem;
    border: 1px solid #3b013b;
    background: #3b013b;
    color: white;
    cursor: pointer;
  }
  
  form button:hover,
  form button:active {
    background: #750175;
    border-color: #750175;
  }
  
  form button:disabled {
    background: #ccc;
    border-color: #ccc;
    color: white;
    cursor: not-allowed;
  }
  
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  
  li {
    margin: 0.25rem 0;
    padding: 0.25rem;
    border: 1px solid #ccc;
    cursor: pointer;
  }
  
  
  li:hover,
  li:active{
    background: #3b013b ;
    color: white;
    cursor:pointer;
  }
  `,
  shadow:true

})

export class StockFinder{
  
  stockNameInput: HTMLInputElement;

  @State() searchResults: {symbol: string, name: string}[] = [];
  @State() loading=false;
  @Event({bubbles:true , composed: true}) aySymbolsSelected: EventEmitter<string>;

  onFindStocks(event: Event){
    this.loading=true;
    event.preventDefault();
    const stockName = this.stockNameInput.value;
    fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${AV_API_KEY}`)
    .then(res => res.json())
    .then(parseRes =>{
      //console.log(parseRes);
       this.searchResults =parseRes['bestMatches'].map(match=>{
         return {name: match['2. name'], symbol: match['1. symbol']};
       });
       this.loading=false;
    })
    .catch(err =>{
      console.log(err);
      this.loading=false;
    })
  }
  
  onSelectSymbol(symbol: string){
     this.aySymbolsSelected.emit(symbol);
  }
  render(){
    let content =(
    <ul>
      {this.searchResults.map(result => 
      (<li onClick={this.onSelectSymbol.bind(this,result.symbol)}><strong>{result.symbol}</strong> - {result.name}</li>)
    )}
    </ul>
    );
    if(this.loading){
      content= <ay-spinner/>;
    }
    return[
    <form onSubmit={this.onFindStocks.bind(this)}>
      < input id="stock-symbol" 
      ref={el => (this.stockNameInput = el)} />
      <button type="submit">
        Find!!
      </button>
    </form>,
    content
    
   ];
  }
}