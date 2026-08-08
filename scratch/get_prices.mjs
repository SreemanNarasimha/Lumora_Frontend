import fetch from 'node-fetch';
fetch('http://localhost:8080/api/products?size=100')
  .then(res => res.json())
  .then(data => console.log(data.content.map(p => p.price)))
  .catch(console.error);
