import { BiScrollbar } from 'lib/biscrollbar';

const container = document.getElementById('container');
container.style.width = '100%';
container.style.height = '20px';

const sc = new BiScrollbar(container);
sc.layout(container.offsetWidth, container.offsetHeight);
sc.setSize(2000);
sc.setRagne(1400, 1600);
sc.onChange(() => {
  console.log(1);
})