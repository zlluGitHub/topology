import { Store, Observer } from 'le5le-store';
import { Options } from './options';
import { Node } from './models/node';
import { TopologyData } from './models/data';

export class DivLayer {
  protected data: TopologyData = Store.get('topology-data');
  canvas = document.createElement('div');
  player = document.createElement('div');
  curNode: Node;
  playBtn: HTMLElement;
  currentTime: HTMLElement;
  progressCurrent: HTMLElement;
  progress: HTMLElement;
  loop: HTMLElement;
  media: HTMLMediaElement;
  videos: { [key: string]: { player: HTMLElement; current: HTMLElement; media: HTMLMediaElement } } = {};
  audios: { [key: string]: { player: HTMLElement; current: HTMLElement; media: HTMLMediaElement } } = {};
  iframes: { [key: string]: HTMLIFrameElement } = {};

  private subcribe: Observer;
  private subcribeNode: Observer;
  constructor(public parentElem: HTMLElement, public options: Options = {}) {
    if (!this.options.playIcon) {
      this.options.playIcon = 'iconfont icon-play';
    }
    if (!this.options.pauseIcon) {
      this.options.pauseIcon = 'iconfont icon-pause';
    }
    if (!this.options.fullScreenIcon) {
      this.options.fullScreenIcon = 'iconfont icon-full-screen';
    }
    if (!this.options.loopIcon) {
      this.options.loopIcon = 'iconfont icon-loop';
    }

    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';
    this.canvas.style.outline = 'none';
    this.canvas.style.background = 'transparent';
    parentElem.appendChild(this.canvas);
    parentElem.appendChild(this.player);
    this.createPlayer();

    this.subcribe = Store.subscribe('addDiv', this.addDiv);

    this.subcribeNode = Store.subscribe('activeNode', (node: Node) => {
      if (!node || (!node.video && !node.audio)) {
        this.player.style.top = '-99999px';
        return;
      }

      if (node.audio && this.audios[node.id]) {
        this.media = this.audios[node.id].media;
      } else if (node.video && this.videos[node.id]) {
        this.media = this.videos[node.id].media;
      } else {
        return;
      }

      this.curNode = node;
      this.player.style.top = this.parentElem.offsetTop + this.parentElem.clientHeight - 40 + 'px';
      this.getMediaCurrent();
      if (this.media.paused) {
        this.playBtn.className = this.options.playIcon;
      } else {
        this.playBtn.className = this.options.pauseIcon;
      }
    });

    document.addEventListener('fullscreenchange', e => {
      if (document.fullscreen) {
        this.media.controls = true;
        this.media.style.userSelect = 'initial';
        this.media.style.pointerEvents = 'initial';
      } else {
        this.media.style.userSelect = 'none';
        this.media.style.pointerEvents = 'none';
        this.media.controls = false;
      }
    });
  }

  addDiv = (node: Node) => {
    if (node.audio) {
      if (this.audios[node.id] && this.audios[node.id].media.src !== node.audio) {
        this.audios[node.id].media.src = node.audio;
      }
      this.setElemPosition(node, (this.audios[node.id] && this.audios[node.id].player) || this.addMedia(node, 'audio'));
    }
    if (node.video) {
      if (this.videos[node.id] && this.videos[node.id].media.src !== node.video) {
        this.videos[node.id].media.src = node.video;
      }
      this.setElemPosition(node, (this.videos[node.id] && this.videos[node.id].player) || this.addMedia(node, 'video'));
    }
    if (node.iframe) {
      if (this.iframes[node.id] && this.iframes[node.id].src !== node.iframe) {
        this.iframes[node.id].src = node.iframe;
      }
      this.setElemPosition(node, this.iframes[node.id] || this.addIframe(node));
    }
  };

  createPlayer() {
    this.player.style.position = 'fixed';
    this.player.style.outline = 'none';
    this.player.style.left = this.parentElem.offsetLeft + 'px';
    this.player.style.top = '-99999px';
    this.player.style.width = this.parentElem.clientWidth + 'px';
    this.player.style.height = '40px';
    this.player.style.padding = '10px 15px';
    this.player.style.background = 'rgba(200,200,200,.1)';
    this.player.style.display = 'flex';
    this.player.style.alignItems = 'center';
    this.player.style.userSelect = 'initial';
    this.player.style.pointerEvents = 'initial';
    this.player.style.zIndex = '1';

    this.playBtn = document.createElement('i');
    this.currentTime = document.createElement('span');
    this.progress = document.createElement('div');
    this.progressCurrent = document.createElement('div');
    this.loop = document.createElement('i');
    const fullScreen = document.createElement('i');

    this.playBtn.className = this.options.playIcon;
    this.playBtn.style.fontSize = '18px';
    this.playBtn.style.lineHeight = '20px';
    this.playBtn.style.cursor = 'pointer';
    this.currentTime.style.padding = '0 10px';
    this.currentTime.innerText = '0 / 0';
    this.progress.style.position = 'relative';
    this.progress.style.flexGrow = '1';
    this.progress.style.top = '0';
    this.progress.style.height = '4px';
    this.progress.style.background = '#ccc';
    this.progress.style.borderRadius = '2px';
    this.progress.style.overflow = 'hidden';
    this.progress.style.cursor = 'pointer';
    this.progressCurrent.style.position = 'absolute';
    this.progressCurrent.style.left = '0';
    this.progressCurrent.style.top = '0';
    this.progressCurrent.style.bottom = '0';
    this.progressCurrent.style.width = '0';
    this.progressCurrent.style.background = '#52c41a';
    this.loop.style.margin = '0 10px';
    this.loop.style.padding = '2px 5px';
    this.loop.style.borderRadius = '2px';
    this.loop.className = this.options.loopIcon;
    this.loop.style.fontSize = '18px';
    this.loop.style.lineHeight = '20px';
    this.loop.style.cursor = 'pointer';
    fullScreen.className = this.options.fullScreenIcon;
    fullScreen.style.fontSize = '17px';
    fullScreen.style.lineHeight = '20px';
    fullScreen.style.cursor = 'pointer';

    this.player.appendChild(this.playBtn);
    this.player.appendChild(this.currentTime);
    this.player.appendChild(this.progress);
    this.progress.appendChild(this.progressCurrent);
    this.player.appendChild(this.loop);
    this.player.appendChild(fullScreen);

    this.playBtn.onclick = () => {
      if (this.media.paused) {
        this.media.play();
        this.playBtn.className = this.options.pauseIcon;
      } else {
        this.media.pause();
        this.playBtn.className = this.options.playIcon;
      }
    };

    this.progress.onclick = (e: MouseEvent) => {
      this.media.currentTime = (e.offsetX / this.progress.clientWidth) * this.media.duration;
    };

    this.loop.onclick = () => {
      this.media.loop = !this.media.loop;
      this.curNode.playLoop = this.media.loop;
      if (this.media.loop) {
        this.loop.style.background = '#ddd';
      } else {
        this.loop.style.background = 'none';
      }
    };

    fullScreen.onclick = () => {
      this.media.requestFullscreen();
    };
  }

  getMediaCurrent() {
    if (!this.media) {
      return;
    }
    this.currentTime.innerText =
      this.formatSeconds(this.media.currentTime) + ' / ' + this.formatSeconds(this.media.duration);
    this.progressCurrent.style.width =
      (this.media.currentTime / this.media.duration) * this.progress.clientWidth + 'px';
  }

  addMedia(node: Node, type: string) {
    const player = document.createElement('div');
    const current = document.createElement('div');
    const media = document.createElement(type) as HTMLMediaElement;

    current.style.position = 'absolute';
    current.style.outline = 'none';
    current.style.left = '0';
    current.style.bottom = '0';
    current.style.height = '2px';
    current.style.background = '#52c41a';

    media.style.position = 'absolute';
    media.style.outline = 'none';
    media.style.left = '0';
    media.style.right = '0';
    media.style.top = '0';
    media.style.bottom = '0';
    if (type === 'video') {
      media.style.width = node.rect.width + 'px';
      media.style.height = node.rect.height + 'px';
    }

    player.style.background = 'transparent';

    if (node.play === 1) {
      media.autoplay = true;
    }
    media.loop = node.playLoop;
    media.ontimeupdate = () => {
      current.style.width = (media.currentTime / media.duration) * node.rect.width + 'px';
      this.getMediaCurrent();
      if (this.media === media) {
        if (node.playLoop) {
          media.loop = true;
          this.loop.style.background = '#ddd';
        } else {
          media.loop = false;
          this.loop.style.background = 'none';
        }
      }
    };
    media.onended = () => {
      Store.set('mediaEnd', node);

      if (this.media === media) {
        this.playBtn.className = this.options.playIcon;
      }
      this.playNext(node.nextPlay);
    };
    media.onloadedmetadata = () => {
      this.getMediaCurrent();
    };
    media.src = node[type];

    player.appendChild(media);
    player.appendChild(current);
    this[type + 's'][node.id] = {
      player,
      current,
      media
    };
    this.canvas.appendChild(player);

    return player;
  }

  playNext(next: string) {
    if (!next) {
      return;
    }

    for (const item of this.data.nodes) {
      if (item.tags.indexOf(next) > -1) {
        if (item.audio && this.audios[item.id] && this.audios[item.id].media && this.audios[item.id].media.paused) {
          this.audios[item.id].media.play();
        } else if (item.video && this.videos[item.id].media && this.videos[item.id].media.paused) {
          this.videos[item.id].media.play();
        }
      }
    }
  }

  addIframe(node: Node) {
    const iframe = document.createElement('iframe');
    iframe.scrolling = 'no';
    iframe.frameBorder = '0';
    iframe.src = node.iframe;
    this.iframes[node.id] = iframe;
    this.canvas.appendChild(iframe);
    return iframe;
  }

  setElemPosition(node: Node, elem: HTMLElement) {
    elem.style.position = 'absolute';
    elem.style.outline = 'none';
    elem.style.left = node.rect.x + 'px';
    elem.style.top = node.rect.y + 'px';
    elem.style.width = node.rect.width + 'px';
    elem.style.height = node.rect.height + 'px';
    if (node.video && this.videos[node.id] && this.videos[node.id].media) {
      this.videos[node.id].media.style.width = '100%';
      this.videos[node.id].media.style.height = '100%';
    }
    if (this.data.locked > -1) {
      elem.style.userSelect = 'none';
      elem.style.pointerEvents = 'none';
    } else {
      elem.style.userSelect = 'initial';
      elem.style.pointerEvents = 'initial';
    }
  }

  removeDiv(item: Node) {
    if (this.curNode && item.id === this.curNode.id) {
      this.curNode = null;
      this.media = null;
      this.player.style.top = '-99999px';
    }
    if (item.audio) {
      this.canvas.removeChild(this.audios[item.id].player);
      this.audios[item.id] = null;
    }
    if (item.video) {
      this.canvas.removeChild(this.videos[item.id].player);
      this.videos[item.id] = null;
    }
    if (item.iframe) {
      this.canvas.removeChild(this.iframes[item.id]);
      this.iframes[item.id] = null;
    }
  }

  clear() {
    for (const item of this.data.nodes) {
      if (item.audio) {
        this.canvas.removeChild(this.audios[item.id].player);
        this.audios[item.id] = null;
      }
      if (item.video) {
        this.canvas.removeChild(this.videos[item.id].player);
        this.videos[item.id] = null;
      }
      if (item.iframe) {
        this.canvas.removeChild(this.iframes[item.id]);
        this.iframes[item.id] = null;
      }
    }
  }

  formatSeconds(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = Math.floor(seconds % 60);

    let txt = s + '';
    if (m) {
      txt = m + ':' + s;
    } else {
      txt = '0:' + s;
    }
    if (h) {
      txt = h + ':' + m + ':' + s;
    }

    return txt;
  }

  resize(size?: { width: number; height: number }) {
    if (size) {
      this.canvas.style.width = size.width + 'px';
      this.canvas.style.height = size.height + 'px';
    } else {
      if (this.options.width && this.options.width !== 'auto') {
        this.canvas.style.width = this.options.width + 'px';
      } else {
        this.canvas.style.width = this.parentElem.clientWidth + 'px';
      }
      if (this.options.height && this.options.height !== 'auto') {
        this.canvas.style.height = this.options.height + 'px';
      } else {
        this.canvas.style.height = this.parentElem.clientHeight - 8 + 'px';
      }
    }
  }

  render() {
    for (const item of this.data.nodes) {
      this.addDiv(item);
    }
  }

  destory() {
    this.clear();
    this.subcribe.unsubscribe();
    this.subcribeNode.unsubscribe();
  }
}
