<template lang="html">
  <app-wrapper :todos="todos">
    <app-navi />
    <app-register
      v-if="todoFilter !== 'completedTodos'"
      :todo-id="targetTodo.id"
      :todo-title.sync="targetTodo.title"
      :todo-detail.sync="targetTodo.detail"
      :todo-rows="rows"
      @addTodo="addTodo"
      @editTodo="editTodo"
    />
    <!--
      :todo-title="targetTodo.title"
      @update:todoTitle="targetTodo.title = $event"

      ここのeventの中に子要素の$event.target.valueがはいってくる。
      で、入力された値がdata内のtargetTodo.titleに代入される


      :todo-detail="targetTodo.detail"
      @update:todoDetail="targetTodo.detail = $event"

      :props名="dataの値" => 子へ渡すprops
      @update:props名="dataの値 = 上の「propsに指定したい値」" => 子のイベント購読
    -->
    <app-error-message
      v-if="errorMessage"
      :error-message="errorMessage"
    />
    <template v-slot:todos>
      <app-list
        v-if="filteredTodos.length"
        :todos="filteredTodos"
        @changeCompleted="changeCompleted"
        @showEditor="showEditor"
        @deleteTodo="deleteTodo"
      />
      <app-empty-message
        v-else
        :empty-message="emptyMessage"
      />
    </template>
  </app-wrapper>
</template>

<script>

import axios from 'axios';

import Wrapper from 'TodoRouterDir/components/Wrapper';
import Navi from 'TodoRouterDir/components/Navi';
import { ErrorMessage, EmptyMessage } from 'TodoRouterDir/components/Message';
import Register from 'TodoRouterDir/components/Register';
import List from 'TodoRouterDir/components/List';
import { log } from 'util';

export default {
  components: {
    appWrapper: Wrapper,
    appNavi: Navi,
    appErrorMessage: ErrorMessage,
    appEmptyMessage: EmptyMessage,
    appList: List,
    appRegister: Register,
  },
  data() {
    return {
      todos: [],
      todoFilter: '',
      filteredTodos: [],
      targetTodo: {
        id: null,
        title: '',
        detail: '',
        completed: '',
      },
      errorMessage: '',
      emptyMessage: '',
    };
  },
  computed: {
    rows() {
      const num = this.targetTodo.detail.split('\n').length;
      return (num > 3) ? num : 3;
    },
  },
  watch: {
    $route() {
      this.setFilter();
    },
    todos() {
      this.setFilter();
    },
  },
  created() {
    axios.get('http://localhost:3000/api/todos/').then(({ data }) => {
      this.todos = data.todos.reverse();
      this.setFilter();
    }).catch((err) => {
      this.showError(err);
      this.setFilter();
    });
  },
  methods: {
    setFilter() {
      const routeName = this.$route.name;
      // console.log(this.$route.name); //allTodosが全件の時は表示される。

      this.todoFilter = routeName;
      if (routeName === 'completedTodos') {
        this.filteredTodos = this.todos.filter(todo => todo.completed); //completedの物だけ引っ張ってくる。
      } else if (routeName === 'incompleteTodos') {
        this.filteredTodos = this.todos.filter(todo => !todo.completed);
      } else {
        this.filteredTodos = this.todos;
      }
      if (!this.filteredTodos.length) this.setEmptyMessage();
    },
    setEmptyMessage() {
      if (this.todoFilter === 'completedTodo') {
        this.emptyMessage = '完了済みのやることリストはありません。';
      } else if (this.todoFilter === 'incompleteTodo') {
        this.emptyMessage = '未完了のやることリストはありません。';
      } else {
        this.emptyMessage = 'やることリストには何も登録されていません。';
      }
    },
    initTargetTodo() {
      return {
        id: null,
        title: '',
        detail: '',
        completed: false,
      };
    },
    hideError() {
      this.errorMessage = '';
    },
    showError(err) {
      if (err.response) {
        this.errorMessage = err.response.data.message;
      } else {
        this.errorMessage = 'ネットに接続がされていない、もしくはサーバーとの接続がされていません。ご確認ください。';
      }
    },
    addTodo() {
      if (!this.targetTodo.title || !this.targetTodo.detail) { //どちらかが空の場合
        this.errorMessage = 'タイトルと内容はどちらも必須項目です。';
        return;
      }
      const postTodo = Object.assign({}, {  //送るtodoのデータをpostTodoと定義
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      });
      axios.post('http://localhost:3000/api/todos/', postTodo)
      .then(({ data }) => {
        // console.log(data); //dataにはリクエストしたオブジェクトがまるっと入って返ってきてる
        this.todos.unshift(data); //データ内のtodosに配列を加えている
        this.targetTodo = this.initTargetTodo();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    changeCompleted(todo) {
    // console.log(todo); //完了、未完了ボタンをクリックした対象のdataが入っている。
      this.targetTodo = this.initTargetTodo();
      const targetTodo = Object.assign({}, todo);
      axios.patch(`http://localhost:3000/api/todos/${targetTodo.id}`, {
        completed: !targetTodo.completed, //keyとvalue  ここでひっくり返してあげてしたのdataで返ってくる
      }).then(({ data }) => {
        this.todos = this.todos.map((todoItem) => {
          if (todoItem.id === targetTodo.id) return data;
          return todoItem;
          //返ってきたIDのものと同じ配列に対して返ってきたdataを代入してそれ以外の物に対してはそのまま返す。
        });
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    showEditor(todo) { //listitemでemitしてlistでtodoを引数に渡して返ってきてる。
      this.targetTodo = Object.assign({}, todo);
    },
    editTodo() {
      const targetTodo = this.todos.find(todo => todo.id === this.targetTodo.id);

      // ここではtargetTodoに
      // find(関数）左の条件式で最初にtrueを返したものを受け取って代入いています。
      // データ内の配列todosからオブジェクトのidがデータ内のtargetTodoのidと同じものを受け取っています。
      // Findメソッドで帰ってきている。
      if (
        targetTodo.title === this.targetTodo.title
        && targetTodo.detail === this.targetTodo.detail
      ) {
        this.targetTodo = this.initTargetTodo();
        return;
      }
      axios.patch(`http://localhost:3000/api/todos/${this.targetTodo.id}`, {
        title: this.targetTodo.title,
        detail: this.targetTodo.detail,
      }).then(({ data }) => {
        this.todos = this.todos.map((todo) => {
          if (todo.id === this.targetTodo.id) return data;
          return todo;
        });
        this.targetTodo = this.initTargetTodo();
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
    deleteTodo(id) {
      this.targetTodo = this.initTargetTodo();
      axios.delete(`http://localhost:3000/api/todos/${id}`)
      .then(({ data }) => {
        this.todos = data.todos.reverse();  //処理が成功したらdata内の配列を返ってきたもので置き換え（逆順に）
        this.hideError();
      }).catch((err) => {
        this.showError(err);
      });
    },
  },
};
</script>
