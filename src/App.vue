<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";

function clearInvalidPendingProfileCompletion() {
  const userStore = useUserStore();

  if (userStore.pendingProfileCompletion && !userStore.isLoggedIn) {
    userStore.setPendingProfileCompletion(false);
  }
}

onLaunch(() => {});
onShow(() => {
  clearInvalidPendingProfileCompletion();
});
onHide(() => {});
</script>
<style lang="scss">
@use "@/styles/global.scss";
@use "@/styles/vant.scss";
</style>
