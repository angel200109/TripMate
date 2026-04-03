import { computed, defineComponent, h } from "vue";
import "github-markdown-css/github-markdown.css";
import { renderMarkdownToVNodes } from "@/utils/markdownRenderer";

export default defineComponent({
  name: "MarkdownRenderer",
  props: {
    content: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const children = computed(() => renderMarkdownToVNodes(props.content ?? ""));

    return () => h("div", { class: "markdown-body" }, children.value);
  },
});
