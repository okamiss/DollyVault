Component({
  properties: {
    title: String,
    description: String,
    actionText: String,
  },
  methods: {
    onAction(this: any) {
      this.triggerEvent('action');
    },
  },
});
