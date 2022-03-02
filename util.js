exports.randomInArray = (arr) => Math.floor(Math.random() * arr.length);
exports.debugSingle = (c, r) => c === 50 && r === 50;

exports.handleWebGLErrors = function () {
    function processErrors(str, string) {
        var css =
            "#shaderReport{ box-sizing: border-box; position: absolute; left: 0; top: 0; \
  right: 0; font-family: monaco, monospace; font-size: 12px; z-index: 1000; \
  background-color: #b70000; color: #ffffff; white-space: normal; \
  text-shadow: 0 -1px 0 rgba(0,0,0,.6); line-height: 1.2em; list-style-type: none; \
  padding: 0; margin: 0; max-height: 300px; overflow: auto; } \
  #shaderReport li{ padding: 10px; border-top: 1px solid rgba( 255, 255, 255, .2 ); \
  border-bottom: 1px solid rgba( 0, 0, 0, .2 ) } \
  #shaderReport li p{ padding: 0; margin: 0 } \
  #shaderReport li:nth-child(odd){ background-color: #c9542b }\
  #shaderReport li p:first-child{ color: #eee }";
        var el = document.createElement("style");
        document.getElementsByTagName("head")[0].appendChild(el);
        el.textContent = css;
        var report = document.createElement("ul");
        report.setAttribute("id", "shaderReport");
        document.body.appendChild(report);
        var re = /ERROR: [\d]+:([\d]+): (.+)/gim;
        var lines = string.split("\\n");
        var m;
        while ((m = re.exec(str)) != null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            var li = document.createElement("li");
            var code =
                '<p>ERROR "<b>' + m[2] + '</b>" in line ' + m[1] + "</p>";
            code += "<p>" + lines[m[1] - 1].replace(/^[ \t]+/g, "") + "</p>";
            li.innerHTML = code;
            report.appendChild(li);
        }
    }

    function _h(f, c) {
        return function () {
            var res = f.apply(this, arguments);
            c.apply(this, arguments);
            return res;
        };
    }

    WebGLRenderingContext.prototype.compileShader = _h(
        WebGLRenderingContext.prototype.compileShader,
        function (shader) {
            if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
                var errors = this.getShaderInfoLog(shader);
                var source = this.getShaderSource(shader);
                processErrors(errors, source);
            }
        }
    );
};

function polarToCartesian(r, theta) {
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
    };
}
exports.polarToCartesian = polarToCartesian;

exports.formatColorString = function (vec, type) {
    let str = "";

    switch (type) {
        case "hsl":
            str = `hsl(${vec[0]}, ${vec[1]}%, ${vec[2]}%)`;
            break;
    }

    return str;
};

// TODO: Maybe fix with quaternions so we can pass to vertex shader
// we will have to keep the tracker look at in mind then
function lookAtAndOrient(
    objectToAdjust,
    pointToLookAt,
    pointToOrientXTowards,
    scaling = 1
) {
    var v1 = pointToOrientXTowards
        .clone()
        .sub(objectToAdjust.position)
        .normalize();
    var v2 = pointToLookAt.clone().sub(objectToAdjust.position).normalize();
    var v3 = new THREE.Vector3().crossVectors(v1, v2).normalize();
    objectToAdjust.up.copy(v3);
    // if (scaling !== 1) objectToAdjust.up.setScalar(scaling);
    objectToAdjust.lookAt(pointToLookAt);
    // objectToAdjust.matrixWorldNeedsUpdate = true;
    // objectToAdjust.updateWorldMatrix();
}
exports.lookAtAndOrient = lookAtAndOrient;

function ensureScreenQuad(quad, camera) {
    const distance = camera.position.z - quad.position.z;
    const aspect = window.innerWidth / window.innerHeight;
    const vFov = (camera.fov * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(vFov / 2) * distance;
    const planeWidth = planeHeight * aspect;

    return [planeWidth, planeHeight];
}
exports.ensureScreenQuad = ensureScreenQuad;

exports.chunk = function (arr, chunkSize = 1, cache = []) {
    const tmp = [...arr];
    if (chunkSize <= 0) return cache;
    while (tmp.length) cache.push(tmp.splice(0, chunkSize));
    return cache;
};

const EASINGS = {
    Linear: {
        None: function (k) {
            return k;
        },
    },
    Quad: {
        In: function (k) {
            return k * k;
        },
        Out: function (k) {
            return k * (2 - k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k;
            return -0.5 * (--k * (k - 2) - 1);
        },
    },
    Cubic: {
        In: function (k) {
            return k * k * k;
        },
        Out: function (k) {
            return --k * k * k + 1;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k;
            return 0.5 * ((k -= 2) * k * k + 2);
        },
    },
    Quart: {
        In: function (k) {
            return k * k * k * k;
        },
        Out: function (k) {
            return 1 - --k * k * k * k;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k;
            return -0.5 * ((k -= 2) * k * k * k - 2);
        },
    },
    Quint: {
        In: function (k) {
            return k * k * k * k * k;
        },
        Out: function (k) {
            return --k * k * k * k * k + 1;
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return 0.5 * k * k * k * k * k;
            return 0.5 * ((k -= 2) * k * k * k * k + 2);
        },
    },
    Sine: {
        In: function (k) {
            return 1 - Math.cos((k * Math.PI) / 2);
        },
        Out: function (k) {
            return Math.sin((k * Math.PI) / 2);
        },
        InOut: function (k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        },
    },
    Expo: {
        In: function (k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function (k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function (k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return 0.5 * Math.pow(1024, k - 1);
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        },
    },
    Circ: {
        In: function (k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function (k) {
            return Math.sqrt(1 - --k * k);
        },
        InOut: function (k) {
            if ((k *= 2) < 1) return -0.5 * (Math.sqrt(1 - k * k) - 1);
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        },
    },
    Elastic: {
        In: function (k, a = 1, p = 0.4) {
            var s;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = (p * Math.asin(1 / a)) / (2 * Math.PI);
            return -(
                a *
                Math.pow(2, 10 * (k -= 1)) *
                Math.sin(((k - s) * (2 * Math.PI)) / p)
            );
        },
        Out: function (k, a = 1, p = 0.4) {
            var s;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = (p * Math.asin(1 / a)) / (2 * Math.PI);
            return (
                a *
                    Math.pow(2, -10 * k) *
                    Math.sin(((k - s) * (2 * Math.PI)) / p) +
                1
            );
        },
        InOut: function (k, a = 1, p = 0.4) {
            var s;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = (p * Math.asin(1 / a)) / (2 * Math.PI);
            if ((k *= 2) < 1)
                return (
                    -0.5 *
                    (a *
                        Math.pow(2, 10 * (k -= 1)) *
                        Math.sin(((k - s) * (2 * Math.PI)) / p))
                );
            return (
                a *
                    Math.pow(2, -10 * (k -= 1)) *
                    Math.sin(((k - s) * (2 * Math.PI)) / p) *
                    0.5 +
                1
            );
        },
    },
    Back: {
        In: function (k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function (k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut: function (k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) return 0.5 * (k * k * ((s + 1) * k - s));
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        },
    },
    Bounce: {
        In: function (k) {
            return 1 - this.Bounce.Out(1 - k);
        },
        Out: function (k) {
            if (k < 1 / 2.75) {
                return 7.5625 * k * k;
            } else if (k < 2 / 2.75) {
                return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
            } else if (k < 2.5 / 2.75) {
                return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
            } else {
                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
            }
        },
        InOut: function (k) {
            if (k < 0.5) return this.Bounce.In(k * 2) * 0.5;
            return this.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
        },
    },
};

exports.getEase = function (ease) {
    switch (ease) {
        case "easeInQuad":
            return EASINGS.Quad.In;
        case "easeInCubic":
            return EASINGS.Cubic.In;
        case "easeInQuart":
            return EASINGS.Quart.In;
        case "easeInQuint":
            return EASINGS.Quint.In;
        case "easeInSine":
            return EASINGS.Sine.In;
        case "easeInExpo":
            return EASINGS.Expo.In;
        case "easeInCirc":
            return EASINGS.Circ.In;
        case "easeInElastic":
            return EASINGS.Elastic.In;
        case "easeInBack":
            return EASINGS.Back.In;
        case "easeInBounce":
            return EASINGS.Bounce.In;

        case "easeOutQuad":
            return EASINGS.Quad.Out;
        case "easeOutCubic":
            return EASINGS.Cubic.Out;
        case "easeOutQuart":
            return EASINGS.Quart.Out;
        case "easeOutQuint":
            return EASINGS.Quint.Out;
        case "easeOutSine":
            return EASINGS.Sine.Out;
        case "easeOutExpo":
            return EASINGS.Expo.Out;
        case "easeOutCirc":
            return EASINGS.Circ.Out;
        case "easeOutElastic":
            return EASINGS.Elastic.Out;
        case "easeOutBack":
            return EASINGS.Back.Out;
        case "easeOutBounce":
            return EASINGS.Bounce.Out;

        case "easeInOutQuad":
            return EASINGS.Quad.InOut;
        case "easeInOutCubic":
            return EASINGS.Cubic.InOut;
        case "easeInOutQuart":
            return EASINGS.Quart.InOut;
        case "easeInOutQuint":
            return EASINGS.Quint.InOut;
        case "easeInOutSine":
            return EASINGS.Sine.InOut;
        case "easeInOutExpo":
            return EASINGS.Expo.InOut;
        case "easeInOutCirc":
            return EASINGS.Circ.InOut;
        case "easeInOutElastic":
            return EASINGS.Elastic.InOut;
        case "easeInOutBack":
            return EASINGS.Back.InOut;
        case "easeInOutBounce":
            return EASINGS.Bounce.InOut;

        case "linear":
            return EASINGS.Linear.None;
    }
};
