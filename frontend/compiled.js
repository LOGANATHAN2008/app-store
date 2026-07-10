import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/admin/promotions/PromotionsManager.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=64eb1d3c"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=64eb1d3c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=64eb1d3c";
import { Upload, Link as LinkIcon, Clock, CheckCircle2, Save, Trash2, Power } from "/node_modules/.vite/deps/lucide-react.js?v=64eb1d3c";
import { useQuery, useMutation, useQueryClient } from "/node_modules/.vite/deps/@tanstack_react-query.js?v=64eb1d3c";
import { promoApi, uploadApi } from "/src/services/api.js?t=1783092357268";
import toast from "/node_modules/.vite/deps/react-hot-toast.js?v=64eb1d3c";
export default function PromotionsManager() {
  _s();
  const queryClient = useQueryClient();
  const [adForm, setAdForm] = useState({
    active: false,
    imageUrl: "",
    linkUrl: "",
    delaySeconds: 10
  });
  const [isUploading, setIsUploading] = useState(false);
  const { data: serverAds, isLoading } = useQuery({
    queryKey: ["admin-promos"],
    queryFn: () => promoApi.getAds()
  });
  useEffect(() => {
    if (serverAds && serverAds.popupAd) {
      setAdForm(serverAds.popupAd);
    }
  }, [serverAds]);
  const saveAds = useMutation({
    mutationFn: (newAd) => promoApi.updateAds({ popupAd: newAd }),
    onSuccess: () => {
      toast.success("Advertisement saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
    },
    onError: (error) => {
      toast.error("Failed to save ad: " + error.message);
    }
  });
  const handleSave = () => {
    saveAds.mutate(adForm);
  };
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const toastId = toast.loading("Uploading ad image...");
    try {
      const res = await uploadApi.banner(file);
      setAdForm((p) => ({ ...p, imageUrl: res.data.url }));
      toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
      toast.error("Upload failed: " + (err.response?.data?.error || err.message), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  if (isLoading) return /* @__PURE__ */ jsxDEV("div", { className: "text-white", children: "Loading ad settings..." }, void 0, false, {
    fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
    lineNumber: 80,
    columnNumber: 25
  }, this);
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-6 max-w-4xl", children: [
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-white mb-2", children: "Advertisement Manager" }, void 0, false, {
        fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
        lineNumber: 85,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-textSecondary text-sm", children: "Configure global popup advertisements that appear across the App Store." }, void 0, false, {
        fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
        lineNumber: 86,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
      lineNumber: 84,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "bg-[#1C1C1E] border border-white/10 rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-6 pb-6 border-b border-white/10", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-bold text-white", children: "Global Popup Ad" }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 92,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-white/50", children: "This ad will appear as a center popup after a delay." }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 93,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
          lineNumber: 91,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setAdForm((p) => ({ ...p, active: !p.active })),
            className: `flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${adForm.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`,
            children: [
              /* @__PURE__ */ jsxDEV(Power, { className: "w-4 h-4" }, void 0, false, {
                fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
                lineNumber: 102,
                columnNumber: 13
              }, this),
              adForm.active ? "Ad is ACTIVE" : "Ad is OFF"
            ]
          },
          void 0,
          true,
          {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 96,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
        lineNumber: 90,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-textSecondary mb-2", children: "Advertisement Image (Banner)" }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 110,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex gap-4 items-start", children: /* @__PURE__ */ jsxDEV("div", { className: "flex-1", children: /* @__PURE__ */ jsxDEV("div", { className: "relative h-48 rounded-xl border-2 border-dashed border-white/20 bg-black/50 overflow-hidden group flex items-center justify-center", children: adForm.imageUrl ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("img", { src: adForm.imageUrl, className: "w-full h-full object-cover", alt: "Ad Preview" }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 116,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("label", { className: "cursor-pointer bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-md text-white font-medium text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV(Upload, { className: "w-4 h-4" }, void 0, false, {
                fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
                lineNumber: 119,
                columnNumber: 27
              }, this),
              " Change Image",
              /* @__PURE__ */ jsxDEV("input", { type: "file", accept: "image/*", onChange: handleUploadImage, className: "hidden", disabled: isUploading }, void 0, false, {
                fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
                lineNumber: 120,
                columnNumber: 27
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 118,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 117,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 115,
            columnNumber: 19
          }, this) : /* @__PURE__ */ jsxDEV("label", { className: "cursor-pointer flex flex-col items-center justify-center text-white/50 hover:text-white transition-colors w-full h-full", children: [
            /* @__PURE__ */ jsxDEV(Upload, { className: "w-8 h-8 mb-2" }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 126,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium", children: "Click to upload ad banner" }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 127,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("input", { type: "file", accept: "image/*", onChange: handleUploadImage, className: "hidden", disabled: isUploading }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 128,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 125,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 113,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 112,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 111,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
          lineNumber: 109,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-textSecondary mb-2", children: "Target URL (Where should they go when they click?)" }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 138,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(LinkIcon, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 140,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "text",
                value: adForm.linkUrl,
                onChange: (e) => setAdForm((p) => ({ ...p, linkUrl: e.target.value })),
                placeholder: "https://example.com/promo",
                className: "w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#007AFF] outline-none"
              },
              void 0,
              false,
              {
                fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
                lineNumber: 141,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 139,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
          lineNumber: 137,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { className: "block text-sm font-medium text-textSecondary mb-2", children: "Delay Timer (Seconds before showing ad)" }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 153,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative w-48", children: [
            /* @__PURE__ */ jsxDEV(Clock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 155,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                type: "number",
                min: "0",
                value: adForm.delaySeconds,
                onChange: (e) => setAdForm((p) => ({ ...p, delaySeconds: parseInt(e.target.value) || 0 })),
                className: "w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#007AFF] outline-none"
              },
              void 0,
              false,
              {
                fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
                lineNumber: 156,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 154,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-white/40 mt-1", children: "Example: 10 seconds means the popup will appear 10 seconds after a user visits the site." }, void 0, false, {
            fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
            lineNumber: 164,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
          lineNumber: 152,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
        lineNumber: 107,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-8 pt-6 border-t border-white/10 flex justify-end", children: /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: handleSave,
          disabled: saveAds.isPending,
          className: "bg-[#007AFF] hover:bg-[#007AFF]/90 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsxDEV(Save, { className: "w-5 h-5" }, void 0, false, {
              fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
              lineNumber: 174,
              columnNumber: 13
            }, this),
            saveAds.isPending ? "Saving..." : "Save Advertisement Settings"
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
          lineNumber: 169,
          columnNumber: 11
        },
        this
      ) }, void 0, false, {
        fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
        lineNumber: 168,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
      lineNumber: 89,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx",
    lineNumber: 83,
    columnNumber: 5
  }, this);
}
_s(PromotionsManager, "ogbxF94rZp7Bo+X80Xp3aTy8Ig8=", false, function() {
  return [useQueryClient, useQuery, useMutation];
});
_c = PromotionsManager;
var _c;
$RefreshReg$(_c, "PromotionsManager");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/logan_yxmdivk/OneDrive/Desktop/app store/frontend/src/pages/admin/promotions/PromotionsManager.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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O0FBQUEsaUJBQWtJO0FBQUEsYUFacEk7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQWFBO0FBQUEsV0ExREY7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQTJEQTtBQUFBLE1BRUEsdUJBQUMsU0FBSSxXQUFVLHVEQUNiO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxTQUFTaEI7QUFBQUEsVUFDVCxVQUFVVixRQUFRNEI7QUFBQUEsVUFDbEIsV0FBVTtBQUFBLFVBRVY7QUFBQSxtQ0FBQyxRQUFLLFdBQVUsYUFBaEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFBeUI7QUFBQSxZQUN4QjVCLFFBQVE0QixZQUFZLGNBQWM7QUFBQTtBQUFBO0FBQUEsUUFOckM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BT0EsS0FSRjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBU0E7QUFBQSxTQXhGRjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBeUZBO0FBQUEsT0EvRkY7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQWdHQTtBQUVKO0FBQUM3QyxHQTFKdUJELG1CQUFpQjtBQUFBLFVBQ25CSixnQkFTbUJGLFVBV3ZCQyxXQUFXO0FBQUE7QUFBQSxLQXJCTEs7QUFBaUIsSUFBQStDO0FBQUEsYUFBQUEsSUFBQSIsIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwibW90aW9uIiwiVXBsb2FkIiwiTGluayIsIkxpbmtJY29uIiwiQ2xvY2siLCJDaGVja0NpcmNsZTIiLCJTYXZlIiwiVHJhc2gyIiwiUG93ZXIiLCJ1c2VRdWVyeSIsInVzZU11dGF0aW9uIiwidXNlUXVlcnlDbGllbnQiLCJwcm9tb0FwaSIsInVwbG9hZEFwaSIsInRvYXN0IiwiUHJvbW90aW9uc01hbmFnZXIiLCJfcyIsInF1ZXJ5Q2xpZW50IiwiYWRGb3JtIiwic2V0QWRGb3JtIiwiYWN0aXZlIiwiaW1hZ2VVcmwiLCJsaW5rVXJsIiwiZGVsYXlTZWNvbmRzIiwiaXNVcGxvYWRpbmciLCJzZXRJc1VwbG9hZGluZyIsImRhdGEiLCJzZXJ2ZXJBZHMiLCJpc0xvYWRpbmciLCJxdWVyeUtleSIsInF1ZXJ5Rm4iLCJnZXRBZHMiLCJwb3B1cEFkIiwic2F2ZUFkcyIsIm11dGF0aW9uRm4iLCJuZXdBZCIsInVwZGF0ZUFkcyIsIm9uU3VjY2VzcyIsInN1Y2Nlc3MiLCJpbnZhbGlkYXRlUXVlcmllcyIsIm9uRXJyb3IiLCJlcnJvciIsIm1lc3NhZ2UiLCJoYW5kbGVTYXZlIiwibXV0YXRlIiwiaGFuZGxlVXBsb2FkSW1hZ2UiLCJlIiwiZmlsZSIsInRhcmdldCIsImZpbGVzIiwidG9hc3RJZCIsImxvYWRpbmciLCJyZXMiLCJiYW5uZXIiLCJwIiwidXJsIiwiaWQiLCJlcnIiLCJyZXNwb25zZSIsInZhbHVlIiwicGFyc2VJbnQiLCJpc1BlbmRpbmciLCJfYyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJQcm9tb3Rpb25zTWFuYWdlci5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgbW90aW9uIH0gZnJvbSAnZnJhbWVyLW1vdGlvbidcbmltcG9ydCB7IFVwbG9hZCwgTGluayBhcyBMaW5rSWNvbiwgQ2xvY2ssIENoZWNrQ2lyY2xlMiwgU2F2ZSwgVHJhc2gyLCBQb3dlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCdcbmltcG9ydCB7IHVzZVF1ZXJ5LCB1c2VNdXRhdGlvbiwgdXNlUXVlcnlDbGllbnQgfSBmcm9tICdAdGFuc3RhY2svcmVhY3QtcXVlcnknXG5pbXBvcnQgeyBwcm9tb0FwaSwgdXBsb2FkQXBpIH0gZnJvbSAnLi4vLi4vLi4vc2VydmljZXMvYXBpJ1xuaW1wb3J0IHRvYXN0IGZyb20gJ3JlYWN0LWhvdC10b2FzdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gUHJvbW90aW9uc01hbmFnZXIoKSB7XG4gIGNvbnN0IHF1ZXJ5Q2xpZW50ID0gdXNlUXVlcnlDbGllbnQoKVxuICBjb25zdCBbYWRGb3JtLCBzZXRBZEZvcm1dID0gdXNlU3RhdGUoe1xuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgaW1hZ2VVcmw6ICcnLFxuICAgIGxpbmtVcmw6ICcnLFxuICAgIGRlbGF5U2Vjb25kczogMTBcbiAgfSlcbiAgY29uc3QgW2lzVXBsb2FkaW5nLCBzZXRJc1VwbG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCB7IGRhdGE6IHNlcnZlckFkcywgaXNMb2FkaW5nIH0gPSB1c2VRdWVyeSh7XG4gICAgcXVlcnlLZXk6IFsnYWRtaW4tcHJvbW9zJ10sXG4gICAgcXVlcnlGbjogKCkgPT4gcHJvbW9BcGkuZ2V0QWRzKClcbiAgfSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZXJ2ZXJBZHMgJiYgc2VydmVyQWRzLnBvcHVwQWQpIHtcbiAgICAgIHNldEFkRm9ybShzZXJ2ZXJBZHMucG9wdXBBZClcbiAgICB9XG4gIH0sIFtzZXJ2ZXJBZHNdKVxuXG4gIGNvbnN0IHNhdmVBZHMgPSB1c2VNdXRhdGlvbih7XG4gICAgbXV0YXRpb25GbjogKG5ld0FkKSA9PiBwcm9tb0FwaS51cGRhdGVBZHMoeyBwb3B1cEFkOiBuZXdBZCB9KSxcbiAgICBvblN1Y2Nlc3M6ICgpID0+IHtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoJ0FkdmVydGlzZW1lbnQgc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpXG4gICAgICBxdWVyeUNsaWVudC5pbnZhbGlkYXRlUXVlcmllcyh7IHF1ZXJ5S2V5OiBbJ2FkbWluLXByb21vcyddIH0pXG4gICAgfSxcbiAgICBvbkVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgIHRvYXN0LmVycm9yKCdGYWlsZWQgdG8gc2F2ZSBhZDogJyArIGVycm9yLm1lc3NhZ2UpXG4gICAgfVxuICB9KVxuXG4gIGNvbnN0IGhhbmRsZVNhdmUgPSAoKSA9PiB7XG4gICAgc2F2ZUFkcy5tdXRhdGUoYWRGb3JtKVxuICB9XG5cbiAgY29uc3QgaGFuZGxlVXBsb2FkSW1hZ2UgPSBhc3luYyAoZSkgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXVxuICAgIGlmICghZmlsZSkgcmV0dXJuXG5cbiAgICBzZXRJc1VwbG9hZGluZyh0cnVlKVxuICAgIGNvbnN0IHRvYXN0SWQgPSB0b2FzdC5sb2FkaW5nKCdVcGxvYWRpbmcgYWQgaW1hZ2UuLi4nKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCB1cGxvYWRBcGkuYmFubmVyKGZpbGUpXG4gICAgICBzZXRBZEZvcm0ocCA9PiAoeyAuLi5wLCBpbWFnZVVybDogcmVzLmRhdGEudXJsIH0pKVxuICAgICAgdG9hc3Quc3VjY2VzcygnSW1hZ2UgdXBsb2FkZWQhJywgeyBpZDogdG9hc3RJZCB9KVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdG9hc3QuZXJyb3IoJ1VwbG9hZCBmYWlsZWQ6ICcgKyAoZXJyLnJlc3BvbnNlPy5kYXRhPy5lcnJvciB8fCBlcnIubWVzc2FnZSksIHsgaWQ6IHRvYXN0SWQgfSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNVcGxvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgaWYgKGlzTG9hZGluZykgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwidGV4dC13aGl0ZVwiPkxvYWRpbmcgYWQgc2V0dGluZ3MuLi48L2Rpdj5cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS02IG1heC13LTR4bFwiPlxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXdoaXRlIG1iLTJcIj5BZHZlcnRpc2VtZW50IE1hbmFnZXI8L2gxPlxuICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXRleHRTZWNvbmRhcnkgdGV4dC1zbVwiPkNvbmZpZ3VyZSBnbG9iYWwgcG9wdXAgYWR2ZXJ0aXNlbWVudHMgdGhhdCBhcHBlYXIgYWNyb3NzIHRoZSBBcHAgU3RvcmUuPC9wPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctWyMxQzFDMUVdIGJvcmRlciBib3JkZXItd2hpdGUvMTAgcm91bmRlZC0yeGwgcC02XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTYgcGItNiBib3JkZXItYiBib3JkZXItd2hpdGUvMTBcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtd2hpdGVcIj5HbG9iYWwgUG9wdXAgQWQ8L2gyPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LXdoaXRlLzUwXCI+VGhpcyBhZCB3aWxsIGFwcGVhciBhcyBhIGNlbnRlciBwb3B1cCBhZnRlciBhIGRlbGF5LjwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICBcbiAgICAgICAgICA8YnV0dG9uIFxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QWRGb3JtKHAgPT4gKHsgLi4ucCwgYWN0aXZlOiAhcC5hY3RpdmUgfSkpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNCBweS0yIHJvdW5kZWQtZnVsbCBmb250LXNlbWlib2xkIHRyYW5zaXRpb24tYWxsICR7XG4gICAgICAgICAgICAgIGFkRm9ybS5hY3RpdmUgPyAnYmctZ3JlZW4tNTAwLzIwIHRleHQtZ3JlZW4tNDAwJyA6ICdiZy1yZWQtNTAwLzIwIHRleHQtcmVkLTQwMCdcbiAgICAgICAgICAgIH1gfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxQb3dlciBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgIHthZEZvcm0uYWN0aXZlID8gJ0FkIGlzIEFDVElWRScgOiAnQWQgaXMgT0ZGJ31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTZcIj5cbiAgICAgICAgICB7LyogSW1hZ2UgVXBsb2FkICovfVxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LXRleHRTZWNvbmRhcnkgbWItMlwiPkFkdmVydGlzZW1lbnQgSW1hZ2UgKEJhbm5lcik8L2xhYmVsPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC00IGl0ZW1zLXN0YXJ0XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBoLTQ4IHJvdW5kZWQteGwgYm9yZGVyLTIgYm9yZGVyLWRhc2hlZCBib3JkZXItd2hpdGUvMjAgYmctYmxhY2svNTAgb3ZlcmZsb3ctaGlkZGVuIGdyb3VwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICB7YWRGb3JtLmltYWdlVXJsID8gKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXthZEZvcm0uaW1hZ2VVcmx9IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgb2JqZWN0LWNvdmVyXCIgYWx0PVwiQWQgUHJldmlld1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLWJsYWNrLzYwIG9wYWNpdHktMCBncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHkgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJjdXJzb3ItcG9pbnRlciBiZy13aGl0ZS8yMCBob3ZlcjpiZy13aGl0ZS8zMCBweC00IHB5LTIgcm91bmRlZC1mdWxsIGJhY2tkcm9wLWJsdXItbWQgdGV4dC13aGl0ZSBmb250LW1lZGl1bSB0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxVcGxvYWQgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+IENoYW5nZSBJbWFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e2hhbmRsZVVwbG9hZEltYWdlfSBjbGFzc05hbWU9XCJoaWRkZW5cIiBkaXNhYmxlZD17aXNVcGxvYWRpbmd9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJjdXJzb3ItcG9pbnRlciBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXdoaXRlLzUwIGhvdmVyOnRleHQtd2hpdGUgdHJhbnNpdGlvbi1jb2xvcnMgdy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxVcGxvYWQgY2xhc3NOYW1lPVwidy04IGgtOCBtYi0yXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+Q2xpY2sgdG8gdXBsb2FkIGFkIGJhbm5lcjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS8qXCIgb25DaGFuZ2U9e2hhbmRsZVVwbG9hZEltYWdlfSBjbGFzc05hbWU9XCJoaWRkZW5cIiBkaXNhYmxlZD17aXNVcGxvYWRpbmd9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgey8qIFRhcmdldCBMaW5rICovfVxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LXRleHRTZWNvbmRhcnkgbWItMlwiPlRhcmdldCBVUkwgKFdoZXJlIHNob3VsZCB0aGV5IGdvIHdoZW4gdGhleSBjbGljaz8pPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgPExpbmtJY29uIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdy01IGgtNSB0ZXh0LXdoaXRlLzMwXCIgLz5cbiAgICAgICAgICAgICAgPGlucHV0IFxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCIgXG4gICAgICAgICAgICAgICAgdmFsdWU9e2FkRm9ybS5saW5rVXJsfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHNldEFkRm9ybShwID0+ICh7IC4uLnAsIGxpbmtVcmw6IGUudGFyZ2V0LnZhbHVlIH0pKX1cbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImh0dHBzOi8vZXhhbXBsZS5jb20vcHJvbW9cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBiZy1ibGFjay81MCBib3JkZXIgYm9yZGVyLXdoaXRlLzEwIHJvdW5kZWQteGwgcGwtMTEgcHItNCBweS0zIHRleHQtd2hpdGUgZm9jdXM6Ym9yZGVyLVsjMDA3QUZGXSBvdXRsaW5lLW5vbmVcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7LyogRGVsYXkgVGltZXIgKi99XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtdGV4dFNlY29uZGFyeSBtYi0yXCI+RGVsYXkgVGltZXIgKFNlY29uZHMgYmVmb3JlIHNob3dpbmcgYWQpPC9sYWJlbD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgdy00OFwiPlxuICAgICAgICAgICAgICA8Q2xvY2sgY2xhc3NOYW1lPVwiYWJzb2x1dGUgbGVmdC0zIHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiB3LTUgaC01IHRleHQtd2hpdGUvMzBcIiAvPlxuICAgICAgICAgICAgICA8aW5wdXQgXG4gICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiIFxuICAgICAgICAgICAgICAgIG1pbj1cIjBcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXthZEZvcm0uZGVsYXlTZWNvbmRzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHNldEFkRm9ybShwID0+ICh7IC4uLnAsIGRlbGF5U2Vjb25kczogcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpIHx8IDAgfSkpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBiZy1ibGFjay81MCBib3JkZXIgYm9yZGVyLXdoaXRlLzEwIHJvdW5kZWQteGwgcGwtMTEgcHItNCBweS0zIHRleHQtd2hpdGUgZm9jdXM6Ym9yZGVyLVsjMDA3QUZGXSBvdXRsaW5lLW5vbmVcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtd2hpdGUvNDAgbXQtMVwiPkV4YW1wbGU6IDEwIHNlY29uZHMgbWVhbnMgdGhlIHBvcHVwIHdpbGwgYXBwZWFyIDEwIHNlY29uZHMgYWZ0ZXIgYSB1c2VyIHZpc2l0cyB0aGUgc2l0ZS48L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtOCBwdC02IGJvcmRlci10IGJvcmRlci13aGl0ZS8xMCBmbGV4IGp1c3RpZnktZW5kXCI+XG4gICAgICAgICAgPGJ1dHRvbiBcbiAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVNhdmV9XG4gICAgICAgICAgICBkaXNhYmxlZD17c2F2ZUFkcy5pc1BlbmRpbmd9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJiZy1bIzAwN0FGRl0gaG92ZXI6YmctWyMwMDdBRkZdLzkwIHRleHQtd2hpdGUgcHgtNiBweS0zIHJvdW5kZWQteGwgZm9udC1zZW1pYm9sZCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0cmFuc2l0aW9uLWNvbG9ycyBkaXNhYmxlZDpvcGFjaXR5LTUwXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8U2F2ZSBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICAgIHtzYXZlQWRzLmlzUGVuZGluZyA/ICdTYXZpbmcuLi4nIDogJ1NhdmUgQWR2ZXJ0aXNlbWVudCBTZXR0aW5ncyd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cbiJdLCJmaWxlIjoiQzovVXNlcnMvbG9nYW5feXhtZGl2ay9PbmVEcml2ZS9EZXNrdG9wL2FwcCBzdG9yZS9mcm9udGVuZC9zcmMvcGFnZXMvYWRtaW4vcHJvbW90aW9ucy9Qcm9tb3Rpb25zTWFuYWdlci5qc3gifQ==