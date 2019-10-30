import Vue from 'vue';　// importing vue from node module.
// import VueRouter from 'vue-router';

// import routes from 'TodoRouterDir/routes';
// import routes from 'TodoVuexDir/routes';
// import store from 'TodoVuexDir/store';
// import routes from 'VuexSample/routes';
// import store from 'VuexSample/store';

import '../scss/global.scss';

// import myApp from './first';
import myApp from 'TodoDir'; // エイリアス　${src}/js/todo which is written in babel.js
// import myApp from 'TodoRouterDir';
// import myApp from 'TodoVuexDir';
// import myApp from 'VuexSample';

// Vue.use(VueRouter);
// const router = new VueRouter({
//   routes,
//   mode: 'history',
// });

new Vue({
  el: '#app', //element and template id #app this is the binding thing of html and vue
  // router,
  // store,
  render: h => h(myApp),  //rendering the html to the web browser.
  // vueのコンポーネントは通常templateの中にhtml文を記述することでブラウザ上に表示させることができます。
  //renderもtemplateと同様にhtml文をブラウザに表示させることができる関数です。　指定したコンポーネントがマウントされる。
  // render: h => h(myApp), は↓の書き方を短くしたもの
  // render: function (createElement) {
  //   return createElement(myApp)
  // }
});
