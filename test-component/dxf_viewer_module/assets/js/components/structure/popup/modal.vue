<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="title-building">{{ header }}</h2>
          </div>

          <div class="modal-body">
            <slot name="body"><div v-html="body"></div></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <div v-if="error" class="alert w-100 alert-danger">
                {{ error }}
              </div>
              <div class="d-flex w-100 justify-content-between">
                <div>
                  <div v-if="loading" class="spinner-border"></div>
                </div>
                <div>
                  <div v-if="buttonText != ''">
                    <button class="btn btn-primary" @click="$emit('action')">
                      {{buttonText}}
                    </button>
                  </div>
                  <div v-else>
                    <button class="btn btn-primary me-2" @click="$emit('no')">
                      No&nbsp;
                    </button>
                    <button class="btn btn-light" @click="$emit('yes')">
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    header: {
      type: String,
      default: "",
    },
    body: {
      type: String,
      default: "",
    },
    footer: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    buttonText: {
      type: String,
      default: "",
    },
  },
};
</script>
