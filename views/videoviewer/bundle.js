var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
System.register("interfaces/Video", [], function (exports_1, context_1) {
    "use strict";
    var VideoSource;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            (function (VideoSource) {
                VideoSource[VideoSource["LOCAL_FILE"] = 0] = "LOCAL_FILE";
                VideoSource[VideoSource["WEB_URL"] = 1] = "WEB_URL";
            })(VideoSource || (VideoSource = {}));
            exports_1("VideoSource", VideoSource);
        }
    };
});
System.register("videoviewer/VideoViewer", [], function (exports_2, context_2) {
    "use strict";
    var VideoViewer;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
            VideoViewer = /** @class */ (function () {
                function VideoViewer(videoUrl) {
                    var _this = this;
                    this.disableControls = false;
                    this.videoElm = $("#video")[0];
                    this.videoElm.setAttribute('src', videoUrl);
                    this.fwdInd = $("#fwd");
                    this.timeInd = $("#time");
                    this.bkdInd = $("#bkd");
                    this.spdInd = $("#spd");
                    this.bookmarkBtn = $("#bookmark");
                    this.bookmarkList = $("#bookmarks");
                    this.comment = $('#comment');
                    var playbackSlider = $('#playbackRate');
                    playbackSlider.change(function () {
                        _this.setPlaybackSpeed(playbackSlider.val() / 100);
                    });
                    this.setMetadata({
                        fps: 24,
                        bookmarks: [],
                        tags: '',
                        version: 1,
                    });
                    $(window).keydown(function (e) { return _this.onKeyDown(e); }).keyup(function (e) { return _this.onKeyUp(e); });
                    this.videoElm.ontimeupdate = function () { return _this.onFrameChange(); };
                    this.comment.focus(function () {
                        _this.disableControls = true;
                    });
                    this.comment.focusout(function () {
                        _this.disableControls = false;
                    });
                    $(window).bind('mousewheel DOMMouseScroll', function (event) {
                        if (_this.disableControls)
                            return;
                        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                            _this.stepForward();
                        }
                        else {
                            _this.stepBackward();
                        }
                    });
                    this.bookmarkBtn.click(function () { return _this.onBookmarkBtnClick(); });
                    this.saveMetadata = function (m) { return _this.setMetadata(m); }; //default handler: do nothing and just update data directly
                    this.onFrameChange();
                }
                Object.defineProperty(VideoViewer.prototype, "metadata", {
                    get: function () {
                        return this.meta;
                    },
                    enumerable: true,
                    configurable: true
                });
                VideoViewer.prototype.setSaveMetaHandler = function (handler) {
                    this.saveMetadata = handler;
                };
                VideoViewer.prototype.onKeyDown = function (evt) {
                    if (evt.which === 50) { // ctrl
                        this.press2 = true;
                    }
                    if (evt.which === 51) { // ctrl
                        this.press3 = true;
                    }
                };
                VideoViewer.prototype.onKeyUp = function (e) {
                    if (e.which === 50) { // ctrl
                        this.press2 = false;
                    }
                    if (e.which === 51) { // ctrl
                        this.press3 = false;
                    }
                    if (this.disableControls)
                        return;
                    if ((e.keyCode || e.which) === 77) {
                        this.videoElm.muted = !this.videoElm.muted;
                        console.log("re");
                    }
                    if ((e.keyCode || e.which) === 32) {
                        /*
                                        if (videoElm.paused) videoElm.play();
                                        else videoElm.pause();
                                        return false;*/
                    }
                    if ((e.keyCode || e.which) === 46) {
                        this.stepForward();
                    }
                    if ((e.keyCode || e.which) === 44) {
                        this.stepBackward();
                    }
                };
                VideoViewer.prototype.setMetadata = function (metadata) {
                    if (!metadata.fps) {
                        console.error('No FPS given for video. Setting to 24 by default');
                        metadata.fps = 24;
                    }
                    this.meta = metadata;
                    if (metadata.bookmarks)
                        this.bookmarkList.empty();
                    this.meta.bookmarks = this.meta.bookmarks.sort(function (a, b) { return a.time - b.time; });
                    for (var _i = 0, _a = this.meta.bookmarks; _i < _a.length; _i++) {
                        var bookmark = _a[_i];
                        this.bookmarkList.append(this.createBookmarkElm(bookmark));
                    }
                    this.updateCurrentBookmarkView(true);
                };
                Object.defineProperty(VideoViewer.prototype, "curFrame", {
                    get: function () {
                        return this.toFrame(this.videoElm.currentTime);
                    },
                    set: function (frame) {
                        this.videoElm.currentTime = this.toTime(frame);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(VideoViewer.prototype, "curTime", {
                    get: function () {
                        return this.videoElm.currentTime;
                    },
                    enumerable: true,
                    configurable: true
                });
                VideoViewer.prototype.seekTime = function (time) {
                    this.videoElm.currentTime = time;
                };
                VideoViewer.prototype.toTime = function (frame) {
                    return frame / this.meta.fps;
                };
                //finds the nearest frame to a time
                VideoViewer.prototype.toFrame = function (t) {
                    return Math.round(t * this.meta.fps);
                };
                VideoViewer.prototype.createBookmarkElm = function (bookmark) {
                    var _this = this;
                    var link = $('<a class="bookmark-link"></a>')
                        .text(this.toFrame(bookmark.time) + '-' + bookmark.comment)
                        .click(function () { return _this.seekTime(bookmark.time); });
                    return $('<li></li>').append(link);
                };
                VideoViewer.prototype.setPlaybackSpeed = function (speed) {
                    this.videoElm.playbackRate = speed;
                };
                VideoViewer.prototype.getFrameSkip = function () {
                    var re = 1;
                    if (this.press2)
                        re = 2;
                    if (this.press3)
                        re = 3;
                    return re;
                };
                //step forward
                VideoViewer.prototype.stepForward = function () {
                    var _this = this;
                    this.fwdInd.css({ opacity: 1 });
                    clearTimeout(this.fwdIndTimer);
                    this.fwdIndTimer = setTimeout(function () { return _this.fwdInd.css({ opacity: 0 }); }, 200);
                    this.videoElm.pause();
                    this.curFrame = this.curFrame + this.getFrameSkip();
                };
                VideoViewer.prototype.stepBackward = function () {
                    var _this = this;
                    this.bkdInd.css({ opacity: 1 });
                    clearTimeout(this.bkIndTimer);
                    this.bkIndTimer = setTimeout(function () { return _this.bkdInd.css({ opacity: 0 }); }, 200);
                    this.videoElm.pause();
                    this.curFrame = this.curFrame - this.getFrameSkip();
                };
                VideoViewer.prototype.onFrameChange = function () {
                    this.timeInd.text(this.curFrame);
                    this.updateCurrentBookmarkView(false);
                };
                VideoViewer.prototype.findBookmarkFromTime = function (time) {
                    var best;
                    var bestVal = Number.POSITIVE_INFINITY;
                    for (var _i = 0, _a = this.meta.bookmarks; _i < _a.length; _i++) {
                        var bk = _a[_i];
                        var t2 = Math.min(bk.time, this.videoElm.duration);
                        var delta = Math.abs(t2 - time);
                        if (delta < bestVal) {
                            bestVal = delta;
                            best = bk;
                        }
                    }
                    // if bookmark is not within 1 frame, exit
                    if (bestVal > 1 / this.metadata.fps) {
                        return undefined;
                    }
                    return best;
                };
                VideoViewer.prototype.updateCurrentBookmarkView = function (keepMissingBookmark) {
                    if (keepMissingBookmark === void 0) { keepMissingBookmark = false; }
                    this.currentBookmark = this.findBookmarkFromTime(this.curTime);
                    //TODO separate bookmarkeditor to separate view
                    if (this.currentBookmark) {
                        this.comment.val(this.currentBookmark.comment);
                        this.comment.prop('disabled', true);
                        this.bookmarkBtn.text('unbookmark');
                    }
                    else {
                        if (!keepMissingBookmark)
                            this.comment.val('');
                        this.comment.prop('disabled', false);
                        this.bookmarkBtn.text('bookmark');
                    }
                };
                VideoViewer.prototype.onBookmarkBtnClick = function () {
                    if (this.currentBookmark) {
                        this.removeBookmark(this.currentBookmark);
                    }
                    else {
                        this.addBookmark({
                            time: this.curTime,
                            comment: this.comment.val().toString(),
                            tags: '' //TODO
                        });
                    }
                };
                VideoViewer.prototype.addBookmark = function (bk) {
                    this.saveMetadata(__assign({}, this.meta, { version: this.meta.version + 1, bookmarks: this.meta.bookmarks.concat(bk) }));
                };
                VideoViewer.prototype.removeBookmark = function (bk) {
                    //no two bookmarks allowed on same frame
                    this.saveMetadata(__assign({}, this.meta, { version: this.meta.version + 1, bookmarks: this.meta.bookmarks.filter(function (x) { return x.time != bk.time; }) }));
                };
                return VideoViewer;
            }());
            exports_2("VideoViewer", VideoViewer);
        }
    };
});
System.register("videoviewer/util", [], function (exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    function ajax(settings) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        $.ajax(__assign({}, settings, { error: function (xhr, textStatus, errorThrown) {
                                reject({ xhr: xhr, textStatus: textStatus, errorThrown: errorThrown });
                            }, success: resolve }));
                    })];
            });
        });
    }
    exports_3("ajax", ajax);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("server/Api", [], function (exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("videoviewer/ServerHook", ["videoviewer/VideoViewer", "videoviewer/util"], function (exports_5, context_5) {
    "use strict";
    var VideoViewer_1, util_1, ServerMetadataSource, LocalStorageMetaSource, ServerHook;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (VideoViewer_1_1) {
                VideoViewer_1 = VideoViewer_1_1;
            },
            function (util_1_1) {
                util_1 = util_1_1;
            }
        ],
        execute: function () {
            ServerMetadataSource = /** @class */ (function () {
                function ServerMetadataSource() {
                    this.errorShown = false;
                }
                ServerMetadataSource.serverApi_UpdateMetadata = function (update) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, util_1.ajax({
                                        type: "POST",
                                        url: '/update_metadata',
                                        data: JSON.stringify(update),
                                        contentType: 'application/json',
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                ServerMetadataSource.serverApi_GetMetadata = function (get) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, util_1.ajax({
                                        type: "GET",
                                        url: '/get_metadata',
                                        data: get,
                                        contentType: 'application/json',
                                        dataType: "json",
                                    })];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    });
                };
                ServerMetadataSource.prototype.getMetadata = function (videoURL) {
                    return __awaiter(this, void 0, void 0, function () {
                        var e_1, ajaxE;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, ServerMetadataSource.serverApi_GetMetadata({ videoURL: videoURL })];
                                case 1: return [2 /*return*/, _a.sent()];
                                case 2:
                                    e_1 = _a.sent();
                                    ajaxE = e_1;
                                    if (ajaxE.errorThrown === "parsererror") {
                                        throw e_1;
                                    }
                                    console.error('unable to contact server:', e_1);
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                ServerMetadataSource.prototype.saveMetadata = function (videoURL, metadata) {
                    return __awaiter(this, void 0, void 0, function () {
                        var e_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, ServerMetadataSource.serverApi_UpdateMetadata({
                                            metadata: metadata,
                                            videoURL: videoURL
                                        })];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_2 = _a.sent();
                                    //do not show annoying error multiple times
                                    if (!this.errorShown)
                                        alert("error trying to contact server. will store in localstorage.");
                                    this.errorShown = true;
                                    console.error('error trying to to contact server:', e_2);
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                return ServerMetadataSource;
            }());
            LocalStorageMetaSource = /** @class */ (function () {
                function LocalStorageMetaSource() {
                }
                LocalStorageMetaSource.prototype.getMetadata = function (videoURL) {
                    return __awaiter(this, void 0, void 0, function () {
                        var item;
                        return __generator(this, function (_a) {
                            item = localStorage.getItem(videoURL);
                            if (!item)
                                return [2 /*return*/, undefined];
                            return [2 /*return*/, JSON.parse(item)];
                        });
                    });
                };
                LocalStorageMetaSource.prototype.saveMetadata = function (videoURL, metadata) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            localStorage.setItem(videoURL, JSON.stringify(metadata));
                            return [2 /*return*/];
                        });
                    });
                };
                return LocalStorageMetaSource;
            }());
            ServerHook = /** @class */ (function () {
                function ServerHook(initData) {
                    var _this = this;
                    this.metaSources = [new ServerMetadataSource(), new LocalStorageMetaSource()];
                    if (!initData)
                        initData = ServerHook.parseInitDataFromURL();
                    if (!initData.videoURL)
                        throw new Error('Video url must be provided');
                    this.videoURL = initData.videoURL;
                    $(function () { return _this.onPageLoad(); });
                }
                ServerHook.parseInitDataFromURL = function () {
                    var urlParams = new URLSearchParams(window.location.search);
                    return {
                        videoURL: urlParams.get("videoURL"),
                    };
                };
                ServerHook.prototype.onPageLoad = function () {
                    var _this = this;
                    this.viewer = new VideoViewer_1.VideoViewer(this.videoURL);
                    this.viewer.setSaveMetaHandler(function (metadata) {
                        return _this.handleMetadataSave(metadata)
                            .catch(function (e) { return ServerHook.handlePromiseRejection(e); });
                    });
                    this.loadMetadata().catch(function (e) { return ServerHook.handlePromiseRejection(e); });
                };
                ServerHook.handlePromiseRejection = function (e) {
                    alert("Fatal error (unhandled rejection): " + e.toString());
                    console.error('unhandled rejection', e);
                };
                ServerHook.prototype.loadMetadata = function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.all(this.metaSources.map(function (source) { return __awaiter(_this, void 0, void 0, function () {
                                        var res;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, source.getMetadata(this.videoURL)];
                                                case 1:
                                                    res = _a.sent();
                                                    if (res) {
                                                        if (res.version > this.viewer.metadata.version) {
                                                            this.viewer.setMetadata(res);
                                                        }
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                ServerHook.prototype.handleMetadataSave = function (metadata) {
                    return __awaiter(this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.all(this.metaSources.map(function (source) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, source.saveMetadata(this.videoURL, metadata)];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                                case 1:
                                    _a.sent();
                                    this.viewer.setMetadata(metadata);
                                    return [2 /*return*/];
                            }
                        });
                    });
                };
                return ServerHook;
            }());
            exports_5("ServerHook", ServerHook);
        }
    };
});
//# sourceMappingURL=bundle.js.map