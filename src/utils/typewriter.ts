export class Typewriter {
  private queue: string[] = [];
  private consuming = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly onConsume: (str: string) => void) {}

  dynamicSpeed() {
    if (this.queue.length === 0) {
      return 200;
    }

    const speed = 2000 / this.queue.length;
    if (speed > 200) {
      return 200;
    }

    return speed;
  }

  add(str: string) {
    if (!str) return;
    this.queue.push(...str.split(""));
  }

  consume() {
    if (this.queue.length === 0) {
      return;
    }

    const str = this.queue.shift();
    if (str) {
      this.onConsume(str);
    }
  }

  next() {
    if (!this.consuming) {
      return;
    }

    if (this.queue.length === 0) {
      this.timer = null;
      return;
    }

    this.consume();
    this.timer = setTimeout(() => {
      if (this.consuming) {
        this.next();
      }
    }, this.dynamicSpeed());
  }

  start() {
    if (this.consuming) {
      return;
    }

    this.consuming = true;
    this.next();
  }

  done() {
    this.consuming = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.onConsume(this.queue.join(""));
    this.queue = [];
  }
}
