class Router {
  constructor() {
    this.handlers = {};
    this.methods = ['get', 'put', 'post', 'del', 'patch', 'head', 'delete'];
    for (const method of this.methods) {
      this[method] = (path, handler) => {
        const m = (method === 'delete' ? 'del' : method);
        if (!this.handlers[m]) this.handlers[m] = {};
        if (!this.handlers[m][path]) this.handlers[m][path] = {};
        this.handlers[m][path] = { path, handler };
      };
    }
  }

  use(path, subRouter) {
    for (const group of Object.keys(subRouter.handlers)) {
      for (const handler of Object.values(subRouter.handlers[group])) {
        this[group]((path === '/' ? '' : path) + handler.path, handler.handler);
      }
    }
  }

  applyRoutes(server) {
    for (const group of Object.keys(this.handlers)) {
      for (const handler of Object.values(this.handlers[group])) {
        server[group](handler.path, handler.handler);
      }
    }
  }
}

module.exports = Router;
