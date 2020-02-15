export const ActionMixin = function(superClass) {
  return class extends superClass {
    fireAction(action, detail) {
      this.dispatchEvent(
        new CustomEvent('action', {
          bubbles: true,
          composed: true,
          detail: {
            action,
            ...detail
          }
        })
      );
    }
  };
};
