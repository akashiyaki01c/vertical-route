import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "縦断面図生成器",
  baseAssets: "/vertical-route/",
  baseServer: "/vertical-route/",

  extends: vikeReact,
} satisfies Config;
