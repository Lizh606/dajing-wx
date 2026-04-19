<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useUserStore } from "@/stores/user";

const WECHAT_PROFILE_PATH = "/pages/auth/wechat-profile";

function getCurrentRoute() {
  try {
    const pages = getCurrentPages();
    const current = pages[pages.length - 1] as { route?: string } | undefined;
    return current?.route ? `/${current.route}` : "";
  } catch {
    return "";
  }
}

function ensurePendingProfileCompletion() {
  const userStore = useUserStore();

  if (!userStore.pendingProfileCompletion) {
    return;
  }

  if (!userStore.isLoggedIn) {
    userStore.setPendingProfileCompletion(false);
    return;
  }

  if (getCurrentRoute() === WECHAT_PROFILE_PATH) {
    return;
  }

  setTimeout(() => {
    uni.reLaunch({ url: WECHAT_PROFILE_PATH });
  }, 80);
}

onLaunch(() => {});
onShow(() => {
  ensurePendingProfileCompletion();
});
onHide(() => {});
</script>
<style lang="scss">
@use "@/styles/global.scss";
@use "@/styles/vant.scss";
</style>
