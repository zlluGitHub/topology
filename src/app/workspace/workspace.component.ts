import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { Topology } from 'topology-core';
import { Options } from 'topology-core/options';


import { Pen } from 'topology-core/models/pen';

import * as FileSaver from 'file-saver';
import { Store } from 'le5le-store';
import { NoticeService } from 'le5le-components/notice';

import { WorkspaceService } from './workspace.service';
import { environment } from 'src/environments/environment';
import { CoreService } from '../core/core.service';

declare var C2S: any;
declare var JSZip: any;

@Component({
  selector: 'app-workspace',
  templateUrl: 'workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  providers: [WorkspaceService]
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  @ViewChild('workspace', { static: true }) workspace: ElementRef;
  tools: any[] = [];
  canvas: Topology;
  canvasOptions: Options = {};
  selection: {
    pen?: Pen;
    pens?: Pen[];
  };

  data: any = {
    id: '',
    version: '',
    data: { pens: [] },
    name: '空白文件',
    desc: '',
    image: '',
    userId: '',
    class: '',
    component: false,
    shared: false
  };
  icons: { icon: string; iconFamily: string; }[] = [];

  user: any;
  subUser: any;

  mouseMoving = false;

  contextmenu: any;
  locked = false;

  editFilename = false;

  divNode: any;

  canvasHeight = 0;

  subRoute: any;
  constructor(
    private service: WorkspaceService,
    private coreService: CoreService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.subUser = Store.subscribe('user', (user: any) => {
      this.user = user;
      if (this.data && user && this.data.userId !== this.user.id) {
        this.data.shared = false;
        this.data.id = '';
      }
    });

    this.canvasOptions.on = this.onMessage;
    // Wait for parent dom render.
    setTimeout(() => {
      this.canvas = new Topology(this.workspace.nativeElement, this.canvasOptions);
      this.subRoute = this.activateRoute.queryParamMap.subscribe(params => {
        if (params.get('id')) {
          this.onOpen({ id: params.get('id'), version: params.get('version') });
        } else {
          this.data = {
            id: '',
            version: '',
            data: { pens: [] },
            name: '空白文件',
            desc: '',
            image: '',
            userId: '',
            class: '',
            component: false,
            shared: false
          };
        }
      });

      this.canvasHeight = this.canvas.canvas.height;
      // For debug
      (window as any).canvas = this.canvas;
      // End
    });

    this.service.canvasRegister();
  }


  onMenu(event: { name: string; data: any; }) {
    if (!this.canvas) {
      return;
    }
    switch (event.name) {
      case 'new':
        this.onNew();
        break;
      case 'open':
        setTimeout(() => {
          this.selection = null;
        });
        this.onNew();
        this.onOpenFile();
        break;
      case 'load':
        this.onOpenFile();
        break;
      case 'save':
        this.save();
        break;
      case 'saveAs':
        this.data.id = '';
        this.save();
        break;
      case 'downJson':
        this.onSaveJson();
        break;
      case 'downZip':
        this.onSaveZip();
        break;
      case 'downPng':
        this.onSavePng();
        break;
      case 'downSvg':
        this.toSVG();
        break;
      case 'undo':
        this.canvas.undo();
        break;
      case 'redo':
        this.canvas.redo();
        break;
      case 'cut':
        this.canvas.cut();
        break;
      case 'copy':
        this.canvas.copy();
        break;
      case 'paste':
        this.canvas.paste();
        break;
      case 'share':
        this.onShare();
        break;
      case 'render':
        this.canvas.render();
        break;
      case 'scale':
        this.canvas.scaleTo(event.data);
        break;
      case 'drawBk':
        this.canvas.clearBkImg();
        this.canvas.render();
        break;
      case 'fullscreen':
        this.workspace.nativeElement.requestFullscreen();
        setTimeout(() => {
          this.canvas.resize();
          this.canvas.overflow();
        }, 500);
        break;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onkeyDocument(key: KeyboardEvent) {
    if ((key.target as HTMLElement).tagName === 'INPUT' || (key.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    let prevent = false;
    switch (key.key) {
      case 'n':
      case 'N':
        if (key.ctrlKey) {
          setTimeout(() => {
            this.selection = null;
          });
          this.onNew();
        }
        prevent = true;
        break;
      case 'o':
      case 'O':
        if (key.ctrlKey) {
          setTimeout(() => {
            this.selection = null;
          });
          this.onNew();
          this.onOpenFile();
        }
        prevent = true;
        break;
      case 'i':
      case 'I':
        if (key.ctrlKey) {
          this.onOpenFile();
        }
        prevent = true;
        break;
      case 's':
      case 'S':
        if (key.ctrlKey) {
          if (key.shiftKey) {
            this.data.id = '';
          }
          this.save();
        }
        prevent = true;
        break;
    }

    if (prevent) {
      key.preventDefault();
      key.returnValue = false;
      return false;
    }
  }

  onEditTool(tool: { id?: string; name: string; }) {
    this.data = {
      id: '',
      version: '',
      data: { pens: [] },
      name: '新组件',
      desc: '',
      image: '',
      userId: '',
      class: tool.name,
      component: true,
      shared: false
    };
    if (tool.id) {

    }

    this.canvas.open(this.data.data);
    this.router.navigateByUrl(`/workspace?id=${this.data.id}&class=${tool.name}`);
  }

  onNew() {
    this.data = {
      id: '',
      version: '',
      data: { pens: [] },
      name: '空白文件',
      desc: '',
      image: '',
      userId: '',
      class: '',
      component: false,
      shared: false
    };
    Store.set('file', this.data);
    this.canvas.open(this.data.data);
    this.router.navigateByUrl('/workspace');
  }

  async onOpen(data: { id: string; version?: string; }) {
    const ret = await this.service.Get(data);
    if (!ret) {
      this.router.navigateByUrl('/workspace');
      return;
    }
    Store.set('recently', {
      id: ret.id,
      version: ret.version,
      image: ret.image,
      name: ret.name,
      desc: ret.desc
    });

    if (this.user && ret.userId !== this.user.id) {
      ret.shared = false;
      ret.id = '';
    }
    this.data = ret;
    Store.set('lineName', ret.data.lineName);
    Store.set('fromArrowType', ret.data.fromArrowType);
    Store.set('toArrowType', ret.data.toArrowType);
    Store.set('scale', ret.data.scale);
    Store.set('locked', ret.data.locked);
    this.canvas.open(ret.data);

    Store.set('file', this.data);
  }

  onOpenFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = event => {
      const elem: any = event.target;
      if (elem.files && elem.files[0]) {
        if (elem.files[0].name.indexOf('.json') > 0) {
          this.openJson(elem.files[0]);
        } else {
          this.openZip(elem.files[0]);
        }

      }
    };
    input.click();
  }

  openJson(file: any) {
    const name = file.name.replace('.json', '');
    this.data.name = name;
    Store.set('file', this.data);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result + '';
      try {
        const data = JSON.parse(text);
        if (data && data.lineName) {
          Store.set('lineName', data.lineName);
          Store.set('fromArrowType', data.fromArrowType);
          Store.set('toArrowType', data.toArrowType);
          this.data = {
            id: '',
            version: '',
            data,
            name: name,
            desc: '',
            image: '',
            userId: '',
            class: '',
            component: false,
            shared: false
          };
          this.canvas.open(data);
        }
      } catch (e) {
        return false;
      }
    };
    reader.readAsText(file);
  }

  async openZip(file: any) {
    if (!this.user) {
      const _noticeService: NoticeService = new NoticeService();
      _noticeService.notice({
        body: '请先登录：上传文件需要身份认证！',
        theme: 'error'
      });
      return;
    }

    const zip = new JSZip();
    await zip.loadAsync(file);

    let data: any = '';
    let name = '';
    for (const key in zip.files) {
      if (zip.files[key].dir) {
        continue;
      }
      const pos = key.indexOf('.json');
      if (pos > 0) {
        name = key;
        name = name.replace('.json', '');
        data = await zip.file(key).async('string');
      }
    }

    if (!name || !data) {
      return false;
    }

    for (const key in zip.files) {
      if (zip.files[key].dir) {
        continue;
      }

      const pos = key.indexOf('.json');
      if (pos < 0) {
        let filename = key.substr(key.lastIndexOf('/') + 1);
        const extPos = filename.lastIndexOf('.');
        let ext = '';
        if (extPos > 0) {
          ext = filename.substr(extPos);
        }
        filename = filename.substring(0, extPos > 8 ? 8 : extPos);
        const result = await this.service.Upload(await zip.file(key).async('blob'), true, filename + ext);
        if (result) {
          data = data.replace(new RegExp(key, 'gm'), result.url);
          await this.service.AddImage(result.url);
        }
      }
    }

    try {
      data = JSON.parse(data);
      if (data && Array.isArray(data.nodes) && Array.isArray(data.lines)) {
        Store.set('lineName', data.lineName);
        Store.set('fromArrowType', data.fromArrowType);
        Store.set('toArrowType', data.toArrowType);
        this.data = {
          id: '',
          version: '',
          data,
          name: name,
          desc: '',
          image: '',
          userId: '',
          class: '',
          component: false,
          shared: false
        };
        this.canvas.open(data);
        Store.set('file', this.data);
      }
    } catch (e) {
      return false;
    }
  }

  save() {
    if (!this.canvas) {
      return;
    }
    this.data.data = this.canvas.data;
    this.canvas.toImage(null, null, async blob => {
      if (this.data.id && !this.coreService.isVip(this.user)) {
        if (!(await this.service.DelImage(this.data.image))) {
          return;
        }
      }

      const file = await this.service.Upload(blob, this.data.shared);
      if (!file) {
        return;
      }
      this.data.image = file.url;

      const ret = await this.service.Save(this.data);
      if (ret) {
        Store.set('file', this.data);
        const _noticeService: NoticeService = new NoticeService();
        _noticeService.notice({
          body: '保存成功！',
          theme: 'success'
        });

        if (!this.data.id || this.activateRoute.snapshot.queryParamMap.get('version')) {
          this.data.id = ret.id;
          this.router.navigate(['/workspace'], { queryParams: { id: this.data.id } });
        } else {
          Store.set('recently', {
            id: this.data.id,
            image: this.data.image,
            name: this.data.name,
            desc: this.data.desc
          });
        }
      }
    });
  }

  onEditFile(input: HTMLElement) {
    this.editFilename = true;
    setTimeout(() => {
      input.focus();
    });
  }

  async onSaveFilename() {
    if (!this.data.name) {
      return;
    }

    if (!this.data.id) {
      this.editFilename = false;
      return;
    }

    if (await this.service.Patch({
      id: this.data.id,
      name: this.data.name
    })) {
      this.editFilename = false;
    }
  }

  onSaveJson() {
    if (!this.canvas) {
      return;
    }
    const data = this.canvas.data;
    FileSaver.saveAs(
      new Blob([JSON.stringify(data)], { type: 'text/plain;charset=utf-8' }),
      `${this.data.name || 'le5le.topology'}.json`
    );
  }

  async onSaveZip() {
    if (!this.canvas) {
      return;
    }
    const _noticeService: NoticeService = new NoticeService();
    _noticeService.notice({
      body: '正在下载打包中，可能需要几分钟，请耐心等待...',
      theme: 'success'
    });

    const data = this.canvas.data;
    const zip = new JSZip();
    zip.file(`${this.data.name || 'le5le.topology'}.json`, JSON.stringify(data));
    await this.zipImages(zip, data.pens);

    zip.generateAsync({ type: 'blob' }).then((blob: any) => {
      FileSaver.saveAs(blob, `${this.data.name || 'le5le.topology'}.zip`);
    }, (err: string) => {
      _noticeService.notice({
        body: err,
        theme: 'error'
      });
    });
  }

  async zipImages(zip: any, pens: any[]) {
    if (!pens) {
      return;
    }

    for (const item of pens) {
      if (item.image) {
        if (item.image.indexOf('/') === 0) {
          const res = await this.http.get(item.image, { responseType: 'blob' }).toPromise();
          zip.file(item.image, res, { createFolders: true });
        } else if (item.img) {
          let image = item.image;
          const pos = image.indexOf('?');
          if (pos > 0) {
            image = image.substring(0, pos);
          }
          await zip.file(image, this.saveToBlob(item.img), { createFolders: true });
        }
      }

      await this.zipImages(zip, item.children);
    }
  }

  saveToBlob(img: HTMLImageElement): Blob {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.setAttribute('origin-clean', 'false');
    canvas.width = img.width;
    canvas.height = img.height;

    const context = canvas.getContext('2d');
    (context as any).filter = window.getComputedStyle(img).filter;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return this.dataUrlToBlob(canvas.toDataURL('image/jpeg'));
  }

  dataUrlToBlob(dataUrl: string) {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  onSavePng(options?: { type?: string; quality?: any; ext?: string; }) {
    if (!options) {
      options = {};
    }
    const name = this.data.name + (options.ext || '.png');
    this.canvas.saveAsImage(name, options.type, options.quality);
  }

  async onShare() {
    if (!this.data.id) {
      return;
    }

    if (
      !(await this.service.Patch({
        id: this.data.id,
        image: this.data.image,
        shared: !this.data.shared
      }))
    ) {
      return;
    }

    this.data.shared = !this.data.shared;
    Store.set('file', this.data);
  }

  onMessage = (event: string, data: any) => {
    switch (event) {
      case 'node':
      case 'addNode':
      case 'line':
      case 'addLine':
        this.selection = {
          pen: data
        };
        this.locked = data.locked;
        break;
      case 'multi':
        this.locked = true;
        if (data && data.length) {
          this.selection = {
            pens: data
          };
          for (const item of data) {
            if (!item.locked) {
              this.locked = false;
              break;
            }
          }
        }
        break;
      case 'space':
        this.selection = null;
        break;
      case 'moveOut':
        this.workspace.nativeElement.scrollLeft += 10;
        this.workspace.nativeElement.scrollTop += 10;
        break;
      case 'resize':
        if (data) {
          this.canvasHeight = data.height;
        }

        if (!this.mouseMoving) {
          this.mouseMoving = true;
          this.workspace.nativeElement.scrollLeft = this.workspace.nativeElement.scrollWidth;
          this.workspace.nativeElement.scrollTop = this.workspace.nativeElement.scrollHeight;
          setTimeout(() => {
            this.mouseMoving = false;
          }, 2000);
        }

        break;
      case 'scale':
        Store.set('scale', data);
        break;
      case 'locked':
        Store.set('locked', data);
        break;
    }
    // console.log('onMessage:', event, data, this.seected);
  };

  onSignup() {
    location.href = `${environment.urls.account}?signup=true`;
  }

  onLogin() {
    location.href = environment.urls.account;
  }

  onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.clientY + 360 < document.body.clientHeight) {
      this.contextmenu = {
        left: event.clientX + 'px',
        top: event.clientY + 'px'
      };
    } else {
      this.contextmenu = {
        left: event.clientX + 'px',
        bottom: '5px'
      };
    }
  }

  @HostListener('document:click', ['$event'])
  onClickDocument(event: MouseEvent) {
    this.contextmenu = null;
  }

  toSVG() {
    const ctx = new C2S(this.canvas.canvas.width + 200, this.canvas.canvas.height + 200);
    for (const item of this.canvas.data.pens) {
      item.render(ctx);
    }

    let mySerializedSVG = ctx.getSerializedSvg();
    mySerializedSVG = mySerializedSVG.replace(
      '<defs/>',
      `<defs>
    <style type="text/css">
      @font-face {
        font-family: 'topology';
        src: url('http://at.alicdn.com/t/font_1331132_h688rvffmbc.ttf?t=1569311680797') format('truetype');
      }
    </style>
  </defs>`
    );

    mySerializedSVG = mySerializedSVG.replace(/--le5le--/g, '&#x');

    const urlObject: any = window.URL || window;
    const export_blob = new Blob([mySerializedSVG]);
    const url = urlObject.createObjectURL(export_blob);

    const a = document.createElement('a');
    a.setAttribute('download', this.data.name + '.svg');
    a.setAttribute('href', url);
    const evt = document.createEvent('MouseEvents');
    evt.initEvent('click', true, true);
    a.dispatchEvent(evt);
  }

  ngOnDestroy() {
    (window as any).canvas = null;
    this.subUser.unsubscribe();
    this.subRoute.unsubscribe();
    this.canvas.destroy();
  }
}
