class model {
    constructor() {
        console.log("model", "const");
        this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    }

    _commit(todos) {
        console.log("model", "_commit");
        this.onTodoListChange(this.todos);
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    addTodo(todoText) {
        console.log("model", "onTodoListChange");
        const newTodo = {
            id:
                this.todos.length > 0
                    ? this.todos[this.todos.length - 1].id + 1
                    : 1,
            text: todoText,
            complete: false,
        };
        this.todos.push(newTodo);
        this._commit(this.todos);
    }

    editTodo(id, updateText) {
        console.log("model", "editTodo");
        this.todos = this.todos.map((todo) =>
            todo.id === id
                ? {
                      id: todo.id,
                      text: updateText,
                      complete: todo.complete,
                  }
                : todo
        );
        this._commit(this.todos);
    }
    deleteTodo(id) {
        console.log("model", "deleteTodo");
        this.todos = this.todos.filter((todo) => todo.id !== id);
        this._commit(this.todos);
    }

    toggleTodo(id) {
        console.log("model", "toggleTodo");
        this.todos = this.todos.map((todo) =>
            todo.id === id
                ? {
                      id: todo.id,
                      text: todo.text,
                      complete: !todo.complete,
                  }
                : todo
        );
        this._commit(this.todos);
    }

    bindTodoListChanged(callback) {
        console.log("model", "bindTodoListCHanged");
        this.onTodoListChange = callback;
    }
}

class view {
    constructor() {
        console.log("view", "const");
        this.app = this.getElement("#root");

        this.title = this.createElement("h1");
        this.title.textContent = "Todos";

        this.form = this.createElement("form");

        this.input = this.createElement("input");
        this.input.type = "text";
        this.input.placeholder = "Add todo";
        this.input.name = "todo";

        this.submitButton = this.createElement("button");
        this.submitButton.textContent = "Submit";

        this.todoList = this.createElement("ul", "todo-list");

        this.form.append(this.input, this.submitButton);

        this.app.append(this.title, this.form, this.todoList);

        this._temporaryTodoText;
        this._initLocalListeners();
    }

    get _todoText() {
        console.log("view", "_todoText");
        return this.input.value;
    }

    _resetInput() {
        this.input.value = "";
    }

    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) element.classList.add(className);
        return element;
    }

    getElement(selector) {
        const element = document.querySelector(selector);
        return element;
    }

    displayTodos(todos) {
        console.log("view", "display todo");

        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild);
        }

        if (todos.length === 0) {
            const p = this.createElement("p");
            p.textContent = "Nothing to do! Add a task?";
            this.todoList.append(p);
        } else {
            todos.forEach((todo) => {
                const li = this.createElement("li");
                li.id = todo.id;

                const checkBox = this.createElement("input");
                checkBox.type = "checkbox";
                checkBox.checked = todo.complete;

                const span = this.createElement("span");
                span.contentEditable = true;
                span.classList.add("editable");

                if (todo.complete) {
                    const strike = this.createElement("s");
                    strike.textContent = todo.text;
                    span.append(strike);
                } else {
                    span.textContent = todo.text;
                }

                const deleteButton = this.createElement("button", "delete");
                deleteButton.textContent = "Delete";

                li.append(checkBox, span, deleteButton);
                this.todoList.append(li);
            });
        }
    }

    _initLocalListeners() {
        this.todoList.addEventListener("input", (event) => {
            if (event.target.className === "editable") {
                this._temporaryTodoText = event.target.innerText;
            }
        });
    }

    bindAddTodo(handler) {
        console.log("view", "bindAddtodo");
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (this._todoText) {
                handler(this._todoText);
                this._resetInput();
            }
        });
    }

    bindDeleteTodo(handler) {
        console.log("view", "bindDeleteTodo");
        this.todoList.addEventListener("click", (event) => {
            if (event.target.className === "delete") {
                const id = parseInt(event.target.parentNode.id);
                handler(id);
            }
        });
    }

    bindToggleTodo(handler) {
        this.todoList.addEventListener("change", (event) => {
            console.log("view", "bindToggleTodo");
            if (event.target.type === "checkbox") {
                const id = parseInt(event.target.parentNode.id);
                handler(id);
            }
        });
    }

    bindEditTodo(handler) {
        console.log("view", "bindEditTodo");
        this.todoList.addEventListener("focusout", (event) => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentNode.id);

                handler(id, this._temporaryTodoText);
                this._temporaryTodoText = "";
            }
        });
    }
}

class controller {
    constructor(model, view) {
        console.log("cont", "const");
        this.model = model;
        this.view = view;

        this.onTodoListChange(this.model.todos);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindEditTodo(this.handleEditTodo);
        this.model.bindTodoListChanged(this.onTodoListChange);
    }

    onTodoListChange = (todos) => {
        console.log("cont", "onTodoListChange");
        this.view.displayTodos(todos);
    };

    handleAddTodo = (todoText) => {
        console.log("cont", "handleADDtodo");
        this.model.addTodo(todoText);
    };

    handleEditTodo = (id, todoText) => {
        console.log("cont", "handleEditTodo");
        this.model.editTodo(id, todoText);
    };

    handleDeleteTodo = (id) => {
        console.log("cont", "handleDeleteTodo");
        this.model.deleteTodo(id);
    };

    handleToggleTodo = (id) => {
        console.log("cont", "handleToggleTodo");
        this.model.toggleTodo(id);
    };
}

const app = new controller(new model(), new view());
