<template>
  <v-layout row justify-center>
    <v-dialog v-model="confirmDialog" persistent max-width="663">
      <v-card>
        <v-card-title class="pa-5 mb-5 message">{{ showMessage }}</v-card-title>
        <v-btn icon class="v-btn--absolute close-btn ma-2" @click="close">
          <v-icon size="40">close</v-icon>
        </v-btn>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info darken-1" flat @click="close">取消</v-btn>
          <v-btn color="info darken-1" flat @click="enableDelete">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: 'confirmDialog',
  data() {
    return {
      confirmDialog: false,
      showMessage: ''
    };
  },
  methods: {
    close() {
      this.confirmDialog = false;
    },
    show(showMessage = '您确定要删除此项吗？') {
      this.confirmDialog = true;
      this.showMessage = showMessage;
    },
    enableDelete() {
      this.$emit('enableDelete');
      this.confirmDialog = false;
    }
  },
};
</script>

<style scoped>
.message {
    font-size: 1.5em;
}
.close-btn {
    right: 0;
    top: 0;
}
</style>
