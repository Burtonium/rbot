<template>
    <transition name="modal">
    <div class="modal-mask"  @click="$emit('dismiss')">
      <div class="modal-wrapper">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <slot name="header">
              default header
            </slot>
            <button type="button" class="close" aria-label="Close" @click="$emit('dismiss')">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {

};
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  position: absolute;
  top:10%;
  z-index: 9999;
  left: 0;
  right: 0;
  margin: auto;
}

.modal-container {
  width: 1000px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.modal-body {
  max-height: 1080px;
  overflow-y:auto;
}
</style>
