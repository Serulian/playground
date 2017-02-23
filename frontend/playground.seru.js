"use strict";
this.Serulian = function ($global) {
  var BOXED_DATA_PROPERTY = '$wrapped';
  var $__currentScriptSrc = null;
  if (typeof $global.document === 'object') {
    $__currentScriptSrc = $global.document.currentScript.src;
  }
  $global.__serulian_internal = {
    autoUnbox: function (k, v) {
      return $t.unbox(v);
    },
    autoBox: function (k, v) {
      if (v == null) {
        return v;
      }
      var typeName = $t.toESType(v);
      switch (typeName) {
        case 'object':
          if (k != '') {
            return $t.fastbox(v, $a.mapping($t.any));
          }
          break;

        case 'array':
          return $t.fastbox(v, $a.slice($t.any));

        case 'boolean':
          return $t.fastbox(v, $a.bool);

        case 'string':
          return $t.fastbox(v, $a.string);

        case 'number':
          if (Math.ceil(v) == v) {
            return $t.fastbox(v, $a.int);
          }
          return $t.fastbox(v, $a.float64);
      }
      return v;
    },
  };
  var $g = {
  };
  var $a = {
  };
  var $w = {
  };
  var $it = function (name, typeIndex) {
    var tpe = new Function(("return function " + name) + "() {};")();
    tpe.$typeId = typeIndex;
    tpe.$typeref = function () {
      return {
        i: typeIndex,
      };
    };
    return tpe;
  };
  var $t = {
    any: $it('Any', 'any'),
    struct: $it('Struct', 'struct'),
    void: $it('Void', 'void'),
    null: $it('Null', 'null'),
    toESType: function (obj) {
      return {
      }.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    markpromising: function (func) {
      func.$promising = true;
      return func;
    },
    functionName: function (func) {
      if (func.name) {
        return func.name;
      }
      var ret = func.toString();
      ret = ret.substr('function '.length);
      ret = ret.substr(0, ret.indexOf('('));
      return ret;
    },
    typeid: function (type) {
      return type.$typeId || $t.functionName(type);
    },
    buildDataForValue: function (value) {
      if (value == null) {
        return {
          v: null,
        };
      }
      if (value.constructor.$typeref) {
        return {
          v: $t.unbox(value),
          t: value.constructor.$typeref(),
        };
      } else {
        return {
          v: value,
        };
      }
    },
    buildValueFromData: function (data) {
      if (!data['t']) {
        return data['v'];
      }
      return $t.box(data['v'], $t.typeforref(data['t']));
    },
    unbox: function (instance) {
      if ((instance != null) && instance.hasOwnProperty(BOXED_DATA_PROPERTY)) {
        return instance[BOXED_DATA_PROPERTY];
      }
      return instance;
    },
    box: function (instance, type) {
      if (instance == null) {
        return null;
      }
      if (instance.constructor == type) {
        return instance;
      }
      return type.$box($t.unbox(instance));
    },
    fastbox: function (instance, type) {
      return type.$box(instance);
    },
    roottype: function (type) {
      if (type.$roottype) {
        return type.$roottype();
      }
      return type;
    },
    istype: function (value, type) {
      if ((type == $t.any) || ((value != null) && ((value.constructor == type) || (value instanceof type)))) {
        return true;
      }
      if (type == $t.struct) {
        var roottype = $t.roottype(value.constructor);
        return ((((roottype.$typekind == 'struct') || (roottype == Number)) || (roottype == String)) || (roottype == Boolean)) || (roottype == Object);
      }
      if ((type.$generic == $a['function']) && (typeof value == 'function')) {
        return value;
      }
      var targetKind = type.$typekind;
      switch (targetKind) {
        case 'struct':

        case 'type':

        case 'class':
          return false;

        case 'interface':
          var targetSignature = type.$typesig();
          var valueSignature = value.constructor.$typesig();
          var expectedKeys = Object.keys(targetSignature);
          for (var i = 0; i < expectedKeys.length; ++i) {
            var expectedKey = expectedKeys[i];
            if (valueSignature[expectedKey] !== true) {
              return false;
            }
          }
          return true;

        default:
          return false;
      }
    },
    cast: function (value, type, opt_allownull) {
      if ((value == null) && !opt_allownull) {
        throw Error('Cannot cast null value to ' + type.toString());
      }
      if ($t.istype(value, type)) {
        return value;
      }
      var targetKind = type.$typekind;
      switch (targetKind) {
        case 'struct':
          if (value.constructor == Object) {
            break;
          }
          throw Error((('Cannot cast ' + value.constructor.toString()) + ' to ') + type.toString());

        case 'class':

        case 'interface':
          throw Error((('Cannot cast ' + value.constructor.toString()) + ' to ') + type.toString());

        case 'type':
          if ($t.roottype(value.constructor) != $t.roottype(type)) {
            throw Error((('Cannot auto-box ' + value.constructor.toString()) + ' to ') + type.toString());
          }
          break;

        case undefined:
          throw Error((('Cannot cast ' + value.constructor.toString()) + ' to ') + type.toString());
      }
      if (type.$box) {
        return $t.box(value, type);
      }
      return value;
    },
    equals: function (left, right, type) {
      if (left === right) {
        return true;
      }
      if ((left == null) || (right == null)) {
        return false;
      }
      if (type.$equals) {
        return type.$equals($t.box(left, type), $t.box(right, type)).$wrapped;
      }
      return false;
    },
    ensurevalue: function (value, type, canBeNull, name) {
      if (value == null) {
        if (!canBeNull) {
          throw Error('Missing value for non-nullable field ' + name);
        }
        return;
      }
      var check = function (serutype, estype) {
        if ((type == $a[serutype]) || (type.$generic == $a[serutype])) {
          if ($t.toESType(value) != estype) {
            throw Error((((('Expected ' + serutype) + ' for field ') + name) + ', found: ') + $t.toESType(value));
          }
          return true;
        }
        return false;
      };
      if (check('string', 'string')) {
        return;
      }
      if (check('float64', 'number')) {
        return;
      }
      if (check('int', 'number')) {
        return;
      }
      if (check('bool', 'boolean')) {
        return;
      }
      if (check('slice', 'array')) {
        return;
      }
      if ($t.toESType(value) != 'object') {
        throw Error((('Expected object for field ' + name) + ', found: ') + $t.toESType(value));
      }
    },
    nativenew: function (type) {
      return function () {
        if (arguments.length == 0) {
          return new type();
        }
        if (type == $global.Promise) {
          return new Promise(arguments[0]);
        }
        var newInstance = Object.create(type.prototype);
        newInstance = type.apply(newInstance, arguments) || newInstance;
        return newInstance;
      };
    },
    typeforref: function (typeref) {
      if (typeref['i']) {
        return $t[typeref['i']];
      }
      var parts = typeref['t'].split('.');
      var current = $g;
      for (var i = 0; i < parts.length; ++i) {
        current = current[parts[i]];
      }
      if (!typeref['g'].length) {
        return current;
      }
      var generics = typeref['g'].map(function (generic) {
        return $t.typeforref(generic);
      });
      return current.apply(current, generics);
    },
    uuid: function () {
      var buf = new Uint16Array(8);
      crypto.getRandomValues(buf);
      var S4 = function (num) {
        var ret = num.toString(16);
        while (ret.length < 4) {
          ret = "0" + ret;
        }
        return ret;
      };
      return ((((((((((S4(buf[0]) + S4(buf[1])) + "-") + S4(buf[2])) + "-") + S4(buf[3])) + "-") + S4(buf[4])) + "-") + S4(buf[5])) + S4(buf[6])) + S4(buf[7]);
    },
    defineStructField: function (structType, name, serializableName, typeref, opt_nominalRootType, opt_nullAllowed) {
      var field = {
        name: name,
        serializableName: serializableName,
        typeref: typeref,
        nominalRootTyperef: opt_nominalRootType || typeref,
        nullAllowed: opt_nullAllowed,
      };
      structType.$fields.push(field);
      Object.defineProperty(structType.prototype, name, {
        get: function () {
          var boxedData = this[BOXED_DATA_PROPERTY];
          if (!boxedData.$runtimecreated) {
            if (!this.$lazychecked[field.name]) {
              $t.ensurevalue($t.unbox(boxedData[field.serializableName]), field.nominalRootTyperef(), field.nullAllowed, field.name);
              this.$lazychecked[field.name] = true;
            }
            var fieldType = field.typeref();
            if (fieldType.$box) {
              return $t.box(boxedData[field.serializableName], fieldType);
            } else {
              return boxedData[field.serializableName];
            }
          }
          return boxedData[name];
        },
        set: function (value) {
          this[BOXED_DATA_PROPERTY][name] = value;
        },
      });
    },
    workerwrap: function (methodId, f) {
      $w[methodId] = f;
      if (!$__currentScriptSrc) {
        return function () {
          var $this = this;
          var args = new Array(arguments.length);
          for (var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
          }
          var promise = new Promise(function (resolve, reject) {
            $global.setTimeout(function () {
              $promise.maybe(f.apply($this, args)).then(function (value) {
                resolve(value);
              }).catch(function (value) {
                reject(value);
              });
            }, 0);
          });
          return promise;
        };
      }
      return function () {
        var token = $t.uuid();
        var args = Array.prototype.map.call(arguments, $t.buildDataForValue);
        var promise = new Promise(function (resolve, reject) {
          var worker = new Worker(($__currentScriptSrc + "?__serulian_async_token=") + token);
          worker.onmessage = function (e) {
            if (!e.isTrusted) {
              worker.terminate();
              return;
            }
            var data = e.data;
            if (data['token'] != token) {
              return;
            }
            var value = $t.buildValueFromData(data['value']);
            var kind = data['kind'];
            if (kind == 'resolve') {
              resolve(value);
            } else {
              reject(value);
            }
            worker.terminate();
          };
          worker.postMessage({
            action: 'invoke',
            arguments: args,
            method: methodId,
            token: token,
          });
        });
        return promise;
      };
    },
    property: function (getter) {
      getter.$property = true;
      return getter;
    },
    nullableinvoke: function (obj, name, promising, args) {
      var found = obj != null ? obj[name] : null;
      if (found == null) {
        return promising ? $promise.resolve(null) : null;
      }
      var r = found.apply(obj, args);
      if (promising) {
        return $promise.maybe(r);
      } else {
        return r;
      }
    },
    dynamicaccess: function (obj, name, promising) {
      if ((obj == null) || (obj[name] == null)) {
        return promising ? $promise.resolve(null) : null;
      }
      var value = obj[name];
      if (typeof value == 'function') {
        if (value.$property) {
          var result = value.apply(obj, arguments);
          return promising ? $promise.maybe(result) : result;
        } else {
          var result = function () {
            return value.apply(obj, arguments);
          };
          return promising ? $promise.resolve(result) : result;
        }
      }
      return promising ? $promise.resolve(value) : value;
    },
    assertnotnull: function (value) {
      if (value == null) {
        throw Error('Value should not be null');
      }
      return value;
    },
    syncnullcompare: function (value, otherwise) {
      return value == null ? otherwise() : value;
    },
    asyncnullcompare: function (value, otherwise) {
      return value == null ? otherwise : value;
    },
    resourcehandler: function () {
      return {
        resources: {
        },
        bind: function (func, isAsync) {
          if (isAsync) {
            return this.bindasync(func);
          } else {
            return this.bindsync(func);
          }
        },
        bindsync: function (func) {
          var r = this;
          var f = function () {
            r.popall();
            return func.apply(this, arguments);
          };
          return f;
        },
        bindasync: function (func) {
          var r = this;
          var f = function (value) {
            var that = this;
            return r.popall().then(function (_) {
              func.call(that, value);
            });
          };
          return f;
        },
        pushr: function (value, name) {
          this.resources[name] = value;
        },
        popr: function (__names) {
          var handlers = [];
          for (var i = 0; i < arguments.length; ++i) {
            var name = arguments[i];
            if (this.resources[name]) {
              handlers.push(this.resources[name].Release());
              delete this.resources[name];
            }
          }
          return $promise.maybeall(handlers);
        },
        popall: function () {
          var handlers = [];
          var names = Object.keys(this.resources);
          for (var i = 0; i < names.length; ++i) {
            handlers.push(this.resources[names[i]].Release());
          }
          return $promise.maybeall(handlers);
        },
      };
    },
  };
  var $generator = {
    directempty: function () {
      var stream = {
        Next: function () {
          return $a['tuple']($t.any, $a['bool']).Build(null, false);
        },
      };
      return stream;
    },
    empty: function () {
      return $generator.directempty();
    },
    new: function (f, isAsync) {
      if (isAsync) {
        var stream = {
          $is: null,
          Next: function () {
            return $promise.new(function (resolve, reject) {
              if (stream.$is != null) {
                $promise.maybe(stream.$is.Next()).then(function (tuple) {
                  if ($t.unbox(tuple.Second)) {
                    resolve(tuple);
                  } else {
                    stream.$is = null;
                    $promise.maybe(stream.Next()).then(resolve, reject);
                  }
                }).catch(function (rejected) {
                  reject(rejected);
                });
                return;
              }
              var $yield = function (value) {
                resolve($a['tuple']($t.any, $a['bool']).Build(value, $t.fastbox(true, $a['bool'])));
              };
              var $done = function () {
                resolve($a['tuple']($t.any, $a['bool']).Build(null, $t.fastbox(false, $a['bool'])));
              };
              var $yieldin = function (ins) {
                stream.$is = ins;
                $promise.maybe(stream.Next()).then(resolve, reject);
              };
              f($yield, $yieldin, reject, $done);
            });
          },
        };
        return stream;
      } else {
        var stream = {
          $is: null,
          Next: function () {
            if (stream.$is != null) {
              var tuple = stream.$is.Next();
              if ($t.unbox(tuple.Second)) {
                return tuple;
              } else {
                stream.$is = null;
              }
            }
            var yielded = null;
            var $yield = function (value) {
              yielded = $a['tuple']($t.any, $a['bool']).Build(value, $t.fastbox(true, $a['bool']));
            };
            var $done = function () {
              yielded = $a['tuple']($t.any, $a['bool']).Build(null, $t.fastbox(false, $a['bool']));
            };
            var $yieldin = function (ins) {
              stream.$is = ins;
            };
            var $reject = function (rejected) {
              throw rejected;
            };
            f($yield, $yieldin, $reject, $done);
            if (stream.$is) {
              return stream.Next();
            } else {
              return yielded;
            }
          },
        };
        return stream;
      }
    },
  };
  var $promise = {
    all: function (promises) {
      return Promise.all(promises);
    },
    maybeall: function (results) {
      return Promise.all(results.map($promise.maybe));
    },
    maybe: function (r) {
      if (r && r.then) {
        return r;
      } else {
        return Promise.resolve(r);
      }
    },
    new: function (f) {
      return new Promise(f);
    },
    empty: function () {
      return Promise.resolve(null);
    },
    resolve: function (value) {
      return Promise.resolve(value);
    },
    reject: function (value) {
      return Promise.reject(value);
    },
    wrap: function (func) {
      return Promise.resolve(func());
    },
    shortcircuit: function (left, right) {
      if (left != right) {
        return $promise.resolve(left);
      }
    },
    translate: function (prom) {
      if (!prom.Then) {
        return prom;
      }
      return {
        then: function () {
          return prom.Then.apply(prom, arguments);
        },
        catch: function () {
          return prom.Catch.apply(prom, arguments);
        },
      };
    },
  };
  var moduleInits = [];
  var $module = function (moduleName, creator) {
    var module = {
    };
    var parts = moduleName.split('.');
    var current = $g;
    for (var i = 0; i < (parts.length - 1); ++i) {
      if (!current[parts[i]]) {
        current[parts[i]] = {
        };
      }
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = module;
    var $newtypebuilder = function (kind) {
      return function (typeId, name, hasGenerics, alias, creator) {
        var buildType = function (fullTypeId, fullName, args) {
          var args = args || [];
          var tpe = new Function(("return function " + fullName) + "() {};")();
          tpe.$typeref = function () {
            if (!hasGenerics) {
              return {
                t: (moduleName + '.') + name,
              };
            }
            var generics = [];
            for (var i = 0; i < args.length; ++i) {
              generics.push(args[i].$typeref());
            }
            return {
              t: (moduleName + '.') + name,
              g: generics,
            };
          };
          tpe.$typeId = fullTypeId;
          tpe.$typekind = kind;
          creator.apply(tpe, args);
          if (kind == 'struct') {
            tpe.$box = function (data) {
              var instance = new tpe();
              instance[BOXED_DATA_PROPERTY] = data;
              instance.$lazychecked = {
              };
              return instance;
            };
            tpe.prototype.$markruntimecreated = function () {
              Object.defineProperty(this[BOXED_DATA_PROPERTY], '$runtimecreated', {
                enumerable: false,
                configurable: true,
                value: true,
              });
            };
            tpe.prototype.String = function () {
              return $t.fastbox(JSON.stringify(this, $global.__serulian_internal.autoUnbox, ' '), $a['string']);
            };
            tpe.prototype.Clone = function () {
              var instance = new tpe();
              if (Object.assign) {
                instance[BOXED_DATA_PROPERTY] = Object.assign({
                }, this[BOXED_DATA_PROPERTY]);
              } else {
                instance[BOXED_DATA_PROPERTY] = {
                };
                for (var key in this[BOXED_DATA_PROPERTY]) {
                  if (this[BOXED_DATA_PROPERTY].hasOwnProperty(key)) {
                    instance[BOXED_DATA_PROPERTY][key] = this[BOXED_DATA_PROPERTY][key];
                  }
                }
              }
              if (this[BOXED_DATA_PROPERTY].$runtimecreated) {
                instance.$markruntimecreated();
              }
              return instance;
            };
            tpe.prototype.Stringify = function (T) {
              var $this = this;
              return function () {
                if (T == $a['json']) {
                  return $promise.resolve($t.fastbox(JSON.stringify($this, $global.__serulian_internal.autoUnbox), $a['string']));
                }
                var mapped = $this.Mapping();
                return $promise.maybe(T.Get()).then(function (resolved) {
                  return resolved.Stringify(mapped);
                });
              };
            };
            tpe.Parse = function (T) {
              return function (value) {
                if (T == $a['json']) {
                  var parsed = JSON.parse($t.unbox(value));
                  var boxed = $t.fastbox(parsed, tpe);
                  var initPromise = $promise.resolve(boxed);
                  if (tpe.$initDefaults) {
                    initPromise = $promise.maybe(tpe.$initDefaults(boxed, false));
                  }
                  return initPromise.then(function () {
                    boxed.Mapping();
                    return boxed;
                  });
                }
                return $promise.maybe(T.Get()).then(function (resolved) {
                  return $promise.maybe(resolved.Parse(value)).then(function (parsed) {
                    return $promise.resolve($t.box(parsed, tpe));
                  });
                });
              };
            };
            tpe.$equals = function (left, right) {
              if (left === right) {
                return $t.fastbox(true, $a['bool']);
              }
              for (var i = 0; i < tpe.$fields.length; ++i) {
                var field = tpe.$fields[i];
                if (!$t.equals(left[BOXED_DATA_PROPERTY][field.serializableName], right[BOXED_DATA_PROPERTY][field.serializableName], field.typeref())) {
                  return $t.fastbox(false, $a['bool']);
                }
              }
              return $t.fastbox(true, $a['bool']);
            };
            tpe.prototype.Mapping = function () {
              if (this.$serucreated) {
                return $t.fastbox(this[BOXED_DATA_PROPERTY], $a['mapping']($t.any));
              } else {
                var $this = this;
                var mapped = {
                };
                tpe.$fields.forEach(function (field) {
                  mapped[field.serializableName] = $this[field.name];
                });
                return $t.fastbox(mapped, $a['mapping']($t.any));
              }
            };
          }
          return tpe;
        };
        if (hasGenerics) {
          module[name] = function genericType () {
            var fullName = name;
            var fullId = typeId;
            var generics = new Array(arguments.length);
            for (var i = 0; i < generics.length; ++i) {
              fullName = (fullName + '_') + $t.functionName(arguments[i]);
              if (i == 0) {
                fullId = fullId + '<';
              } else {
                fullId = fullId + ',';
              }
              fullId = fullId + arguments[i].$typeId;
              generics[i] = arguments[i];
            }
            var cached = module[fullName];
            if (cached) {
              return cached;
            }
            var tpe = buildType(fullId + '>', fullName, generics);
            tpe.$generic = genericType;
            return module[fullName] = tpe;
          };
        } else {
          module[name] = buildType(typeId, name);
        }
        if (alias) {
          $a[alias] = module[name];
        }
      };
    };
    module.$init = function (callback, fieldId, dependencyIds) {
      moduleInits.push({
        callback: callback,
        id: fieldId,
        depends: dependencyIds,
      });
    };
    module.$struct = $newtypebuilder('struct');
    module.$class = $newtypebuilder('class');
    module.$interface = $newtypebuilder('interface');
    module.$type = $newtypebuilder('type');
    creator.call(module);
  };
  $module('codeeditor', function () {
    var $static = this;
    this.$class('92133f1f', 'codeEditorProps', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (IsReadOnly) {
        var instance = new $static();
        instance.IsReadOnly = IsReadOnly;
        return instance;
      };
      this.$typesig = function () {
        return {
        };
      };
    });

    this.$class('8e0a960b', 'CodeEditor', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (props) {
        var instance = new $static();
        instance.props = props;
        return instance;
      };
      $static.Declare = function (props, initialValue) {
        var $temp0;
        return ($temp0 = $g.codeeditor.CodeEditor.new(props), $temp0.initialValue = initialValue, $temp0);
      };
      $instance.Attached = function (node) {
        var $this = this;
        var editor;
        var initialValue;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              $this.element = $t.cast(node, $global.Element, false);
              editor = $global.ace.edit($t.assertnotnull($this.element));
              editor.setTheme($t.unbox($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("ace/theme/", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([$t.syncnullcompare($this.props.Theme, function () {
                return $t.fastbox("monokai", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              })]))));
              initialValue = $t.syncnullcompare($t.nullableinvoke($this.initialValue, 'Trim', false, []), function () {
                return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              });
              editor.getSession().setValue(initialValue.$wrapped);
              if ($this.props.Mode != null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              editor.getSession().setMode($t.unbox($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("ace/mode/", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([$t.syncnullcompare($this.props.Mode, function () {
                return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              })]))));
              $current = 2;
              continue syncloop;

            case 2:
              editor.getSession().on('change', function (e) {
                var onChanged;
                var $current = 0;
                syncloop: while (true) {
                  switch ($current) {
                    case 0:
                      onChanged = $t.dynamicaccess($this.props, 'OnChanged', false);
                      if (onChanged != null) {
                        $current = 1;
                        continue syncloop;
                      } else {
                        $current = 2;
                        continue syncloop;
                      }
                      break;

                    case 1:
                      onChanged($t.fastbox(editor.getSession().getValue(), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                      $current = 2;
                      continue syncloop;

                    default:
                      return;
                  }
                }
              });
              $this.editor = editor;
              $t.nullableinvoke($this.editor, 'setReadOnly', false, [$t.unbox($this.props.IsReadOnly)]);
              return;

            default:
              return;
          }
        }
      };
      $instance.Props = $t.property(function () {
        var $this = this;
        return $this.props;
      });
      $instance.PropsUpdated = function (props) {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              $this.props = $t.cast(props, $g.codeeditor.codeEditorProps, false);
              $t.nullableinvoke($this.editor, 'setReadOnly', false, [$t.unbox($this.props.IsReadOnly)]);
              $t.nullableinvoke($this.editor, 'setTheme', false, [$t.unbox($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("ace/theme/", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([$t.syncnullcompare($this.props.Theme, function () {
                return $t.fastbox("monokai", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              })])))]);
              if ($this.props.Mode != null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              $t.nullableinvoke($t.nullableinvoke($this.editor, 'getSession', false, []), 'setMode', false, [$t.unbox($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("ace/mode/", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([$t.syncnullcompare($this.props.Mode, function () {
                return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              })])))]);
              $current = 2;
              continue syncloop;

            default:
              return;
          }
        }
      };
      $instance.Render = function (context) {
        var $this = this;
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
          className: $t.fastbox("editor", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
        }), $generator.directempty());
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Declare|1|9ed61ffb<8e0a960b>": true,
          "Attached|2|9ed61ffb<void>": true,
          "Props|3|any": true,
          "PropsUpdated|2|9ed61ffb<void>": true,
          "Render|2|9ed61ffb<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.attachment.HEAD.attachment', function () {
    var $static = this;
    this.$class('74359132', 'Attachment', true, '', function (T) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (propName) {
        var instance = new $static();
        instance.propName = propName;
        return instance;
      };
      $static.Global = function (globalId) {
        return $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment(T).new($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("@@", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([globalId])));
      };
      $static.Unique = function (prefix) {
        $g.pkg.github.com.Serulian.attachment.HEAD.attachment.attachmentCounter = $t.fastbox($g.pkg.github.com.Serulian.attachment.HEAD.attachment.attachmentCounter.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
        return $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment(T).new($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("@@", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("-", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([prefix, $g.pkg.github.com.Serulian.attachment.HEAD.attachment.attachmentCounter])));
      };
      $instance.$index = function (instance) {
        var $this = this;
        return $this.Get(instance);
      };
      $instance.$setindex = function (instance, value) {
        var $this = this;
        $this.Set(instance, value);
        return;
      };
      $instance.Get = function (instance) {
        var $this = this;
        var found;
        var propName;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (instance == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return null;

            case 2:
              propName = $this.propName;
              found = $t.cast(instance, $global.Object, false)[propName.$wrapped];
              if (found == null) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              return null;

            case 4:
              return $t.cast(found, T, true);

            default:
              return;
          }
        }
      };
      $instance.Set = function (instance, value) {
        var $this = this;
        var obj;
        var propName;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (instance == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return;

            case 2:
              propName = $this.propName;
              obj = $t.cast(instance, $global.Object, false);
              if (!obj.hasOwnProperty($t.unbox(propName))) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              $global.Object.defineProperty(obj, propName.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($global.Boolean).overObject(function () {
                var obj = {
                };
                obj['writable'] = true;
                obj['configurable'] = false;
                obj['enumerable'] = false;
                return obj;
              }()).$wrapped);
              $current = 4;
              continue syncloop;

            case 4:
              obj[propName.$wrapped] = value;
              return;

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "setindex|4|9ed61ffb<void>": true,
          "Set|2|9ed61ffb<void>": true,
        };
        computed[("Global|1|9ed61ffb<74359132<" + $t.typeid(T)) + ">>"] = true;
        computed[("Unique|1|9ed61ffb<74359132<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        computed[("Get|2|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.attachmentCounter = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        resolve();
      });
    }, '1bd2fcc2', []);
  });
  $module('pkg.github.com.Serulian.component.HEAD.component', function () {
    var $static = this;
    this.$class('530e8bd4', 'componentReporter', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (eventManager) {
        var instance = new $static();
        instance.eventManager = eventManager;
        return instance;
      };
      $instance.NodeRemoved = function (domNode) {
        var $this = this;
        var component;
        var detachEvented;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              try {
                var $expr = $g.pkg.github.com.Serulian.component.HEAD.component.domNodeComponent.Get(domNode);
                component = $expr;
              } catch ($rejected) {
                component = null;
              }
              $current = 1;
              continue syncloop;

            case 1:
              if (component != null) {
                $current = 2;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 2:
              try {
                var $expr = $t.cast(component, $g.pkg.github.com.Serulian.component.HEAD.interfaces.DOMDetached, false);
                detachEvented = $expr;
              } catch ($rejected) {
                detachEvented = null;
              }
              $current = 3;
              continue syncloop;

            case 3:
              $t.nullableinvoke(detachEvented, 'Detached', false, [domNode]);
              $current = 4;
              continue syncloop;

            case 4:
              $this.eventManager.NodeRemoved(domNode);
              return;

            default:
              return;
          }
        }
      };
      $instance.NodeCreated = $t.markpromising(function (virtualNode, domNode) {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.eventManager.NodeCreated(virtualNode, domNode)).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.NodeUpdated = $t.markpromising(function (virtualNode, domNode) {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.eventManager.NodeUpdated(virtualNode, domNode)).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "NodeRemoved|2|9ed61ffb<void>": true,
          "NodeCreated|2|9ed61ffb<void>": true,
          "NodeUpdated|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('c23991cc', 'componentContext', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (eventManager, renderer, diffReporter) {
        var instance = new $static();
        instance.eventManager = eventManager;
        instance.renderer = renderer;
        instance.diffReporter = diffReporter;
        return instance;
      };
      $static.ForElement = function (element) {
        var em;
        em = $g.pkg.github.com.Serulian.virtualdom.HEAD.eventmanager.EventManager.ForElement(element);
        return $g.pkg.github.com.Serulian.component.HEAD.component.componentContext.new(em, $g.pkg.github.com.Serulian.component.HEAD.component.componentRenderer.new(), $g.pkg.github.com.Serulian.component.HEAD.component.componentReporter.new(em));
      };
      $instance.Get = function (T) {
        var $this = this;
        var $f = function (name) {
          return null;
        };
        return $f;
      };
      $instance.Renderer = $t.property(function () {
        var $this = this;
        return $this.renderer;
      });
      $instance.EventManager = $t.property(function () {
        var $this = this;
        return $this.eventManager;
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "ForElement|1|9ed61ffb<c23991cc>": true,
          "Renderer|3|df20448e": true,
          "EventManager|3|8c33a845": true,
        };
        computed[("Get|2|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('b1a59528', 'componentRenderer', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        return instance;
      };
      $instance.Render = $t.markpromising(function (component, root, pathUnderRoot, context) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var attachEvented;
        var cached;
        var detachEvented;
        var propsUpdatable;
        var rendered;
        var requiresCallback;
        var statefulComponent;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                try {
                  var $expr = $t.cast(component, $g.pkg.github.com.Serulian.component.HEAD.interfaces.PropsUpdatable, false);
                  propsUpdatable = $expr;
                } catch ($rejected) {
                  propsUpdatable = null;
                }
                $current = 1;
                $continue($resolve, $reject);
                return;

              case 1:
                if (propsUpdatable != null) {
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 2:
                cached = $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($g.pkg.github.com.Serulian.component.HEAD.interfaces.PropsUpdatable).Global($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("cache-", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([pathUnderRoot]))).Get(context);
                if (cached != null) {
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 3:
                cached.PropsUpdated(propsUpdatable.Props());
                $resolve($t.assertnotnull($g.pkg.github.com.Serulian.component.HEAD.component.componentVirtualNode.Get(cached)));
                return;

              case 4:
                $current = 5;
                $continue($resolve, $reject);
                return;

              case 5:
                $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.RenderToVirtualNode(component, context)).then(function ($result0) {
                  $result = $result0;
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 6:
                rendered = $result;
                if (propsUpdatable != null) {
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 8;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 7:
                rendered = ($temp0 = rendered.Clone(), $temp0.Key = $t.syncnullcompare(rendered.Key, function () {
                  return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("__component_propsupdated_", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([$g.pkg.github.com.Serulian.component.HEAD.component.propsKeyCounter]));
                }), $temp0);
                $g.pkg.github.com.Serulian.component.HEAD.component.propsKeyCounter = $t.fastbox($g.pkg.github.com.Serulian.component.HEAD.component.propsKeyCounter.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                $current = 8;
                $continue($resolve, $reject);
                return;

              case 8:
                requiresCallback = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                try {
                  var $expr = $t.cast(component, $g.pkg.github.com.Serulian.component.HEAD.interfaces.DOMAttached, false);
                  attachEvented = $expr;
                } catch ($rejected) {
                  attachEvented = null;
                }
                $current = 9;
                $continue($resolve, $reject);
                return;

              case 9:
                if (attachEvented != null) {
                  $current = 10;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 11;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 10:
                requiresCallback = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                $current = 11;
                $continue($resolve, $reject);
                return;

              case 11:
                try {
                  var $expr = $t.cast(component, $g.pkg.github.com.Serulian.component.HEAD.interfaces.DOMDetached, false);
                  detachEvented = $expr;
                } catch ($rejected) {
                  detachEvented = null;
                }
                $current = 12;
                $continue($resolve, $reject);
                return;

              case 12:
                if (detachEvented != null) {
                  $current = 13;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 14;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 13:
                requiresCallback = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                $current = 14;
                $continue($resolve, $reject);
                return;

              case 14:
                try {
                  var $expr = $t.cast(component, $g.pkg.github.com.Serulian.component.HEAD.interfaces.StatefulComponent, false);
                  statefulComponent = $expr;
                } catch ($rejected) {
                  statefulComponent = null;
                }
                $current = 15;
                $continue($resolve, $reject);
                return;

              case 15:
                if (statefulComponent != null) {
                  $current = 16;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 17;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 16:
                requiresCallback = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                $current = 17;
                $continue($resolve, $reject);
                return;

              case 17:
                if (requiresCallback.$wrapped) {
                  $current = 18;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 19;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 18:
                rendered = ($temp1 = rendered.Clone(), $temp1.DOMNodeInserted = context.EventManager().RegisterFunction($t.markpromising(function (data) {
                  var $result;
                  var node;
                  var $current = 0;
                  var $continue = function ($resolve, $reject) {
                    while (true) {
                      switch ($current) {
                        case 0:
                          node = $t.cast(data, $global.Node, false);
                          $t.nullableinvoke(attachEvented, 'Attached', true, [node]).then(function ($result0) {
                            $result = $result0;
                            $current = 1;
                            $continue($resolve, $reject);
                            return;
                          }).catch(function (err) {
                            $reject(err);
                            return;
                          });
                          return;

                        case 1:
                          $g.pkg.github.com.Serulian.component.HEAD.component.componentDOMNode.Set(component, node);
                          $g.pkg.github.com.Serulian.component.HEAD.component.domNodeComponent.Set(node, component);
                          $resolve();
                          return;

                        default:
                          $resolve();
                          return;
                      }
                    }
                  };
                  return $promise.new($continue);
                })), $temp1);
                $current = 19;
                $continue($resolve, $reject);
                return;

              case 19:
                $g.pkg.github.com.Serulian.component.HEAD.component.componentVirtualNode.Set(component, rendered);
                $g.pkg.github.com.Serulian.component.HEAD.component.componentsContext.Set(component, $t.cast(context, $g.pkg.github.com.Serulian.component.HEAD.component.componentContext, false));
                if (propsUpdatable != null) {
                  $current = 20;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 21;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 20:
                $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($g.pkg.github.com.Serulian.component.HEAD.interfaces.PropsUpdatable).Global($g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("cache-", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([pathUnderRoot]))).Set(context, propsUpdatable);
                $current = 21;
                $continue($resolve, $reject);
                return;

              case 21:
                $resolve(rendered);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|9ed61ffb<e3adf311>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.UpdateComponentState = $t.markpromising(function (component, newState) {
      var $result;
      var context;
      var currentVirtualNode;
      var diff;
      var node;
      var updatedVirtualNode;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              component.StateUpdated(newState);
              currentVirtualNode = $t.assertnotnull($g.pkg.github.com.Serulian.component.HEAD.component.componentVirtualNode.Get(component));
              context = $t.assertnotnull($g.pkg.github.com.Serulian.component.HEAD.component.componentsContext.Get(component));
              node = $t.assertnotnull($g.pkg.github.com.Serulian.component.HEAD.component.componentDOMNode.Get(component));
              $promise.maybe(context.renderer.Render(component, component, $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), context)).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              updatedVirtualNode = $result;
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ComputeDiff(updatedVirtualNode, $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(currentVirtualNode))).then(function ($result0) {
                $result = $result0;
                $current = 2;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 2:
              diff = $result;
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ApplyDiff(diff, node, context.diffReporter)).then(function ($result0) {
                $result = $result0;
                $current = 3;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 3:
              $g.pkg.github.com.Serulian.component.HEAD.component.componentVirtualNode.Set(component, updatedVirtualNode);
              $resolve();
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.RenderComponent = $t.markpromising(function (component, parent) {
      var $result;
      var $temp0;
      var context;
      var diff;
      var parentVNode;
      var rendered;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              context = $g.pkg.github.com.Serulian.component.HEAD.component.componentContext.ForElement(parent);
              $promise.maybe(context.renderer.Render(component, component, $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), context)).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              rendered = $result;
              parentVNode = ($temp0 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.TagName = $t.fastbox(parent.tagName, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0.Children = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).overArray([rendered]), $temp0);
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ComputeDiff(parentVNode, $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.NodeWrapper.For(parent))).then(function ($result0) {
                $result = $result0;
                $current = 2;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 2:
              diff = $result;
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ApplyDiff(diff, parent, context.diffReporter)).then(function ($result0) {
                $result = $result0;
                $current = 3;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.componentVirtualNode = $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Unique($t.fastbox('cvn', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
        resolve();
      });
    }, 'd85f10a6', ['1bd2fcc2']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.componentDOMNode = $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($global.Node).Unique($t.fastbox('cdn', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
        resolve();
      });
    }, '424da5eb', ['1bd2fcc2']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.domNodeComponent = $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($t.any).Unique($t.fastbox('dnc', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
        resolve();
      });
    }, '6db00a80', ['1bd2fcc2']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.componentsContext = $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($g.pkg.github.com.Serulian.component.HEAD.component.componentContext).Unique($t.fastbox('cc', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
        resolve();
      });
    }, '78bc8cb3', ['1bd2fcc2']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.propsKeyCounter = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        resolve();
      });
    }, 'fd79748e', []);
  });
  $module('pkg.github.com.Serulian.component.HEAD.interfaces', function () {
    var $static = this;
    this.$interface('40ee1a97', 'PropsUpdatable', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Props|3|any": true,
          "PropsUpdated|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('805ca07a', 'DOMAttached', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Attached|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('afa19280', 'DOMDetached', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Detached|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('33294705', 'StatefulComponent', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|9ed61ffb<any>": true,
          "StateUpdated|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.corelib.branch.master.collections', function () {
    var $static = this;
    this.$class('9db7abc3', 'listStream', true, '', function (I) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (list) {
        var instance = new $static();
        instance.list = list;
        instance.index = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        return instance;
      };
      $static.For = function (list) {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.listStream(I).new(list);
      };
      $instance.Next = function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.index.$wrapped >= $this.list.Count().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple(I, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).Build(null, $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));

            case 2:
              $this.index = $t.fastbox($this.index.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple(I, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).Build($this.list.$index($t.fastbox($this.index.$wrapped - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)), $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("For|1|9ed61ffb<9db7abc3<" + $t.typeid(I)) + ">>"] = true;
        computed[("Next|2|9ed61ffb<bc4d0b5d<" + $t.typeid(I)) + ",2d2c9633>>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('0db2f5fd', 'sliceStream', true, '', function (I) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (slice) {
        var instance = new $static();
        instance.slice = slice;
        instance.index = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        return instance;
      };
      $static.For = function (slice) {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.sliceStream(I).new(slice);
      };
      $instance.Next = function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.index.$wrapped >= $this.slice.Length().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple(I, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).Build(null, $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));

            case 2:
              $this.index = $t.fastbox($this.index.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple(I, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).Build($this.slice.$index($t.fastbox($this.index.$wrapped - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)), $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("For|1|9ed61ffb<0db2f5fd<" + $t.typeid(I)) + ">>"] = true;
        computed[("Next|2|9ed61ffb<bc4d0b5d<" + $t.typeid(I)) + ",2d2c9633>>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('67d14404', 'List', true, 'list', function (T) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.internalArray = $t.nativenew($global.Array)();
        instance.indexArray = $t.nativenew($global.Array)();
        return instance;
      };
      $static.forArray = function (arr) {
        var $temp0;
        var $temp1;
        var i;
        var l;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              l = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List(T).Empty();
              $current = 1;
              continue syncloop;

            case 1:
              $temp1 = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer.$range($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(arr.length - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
              $current = 2;
              continue syncloop;

            case 2:
              $temp0 = $temp1.Next();
              i = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              l.Add($t.cast(arr[i.$wrapped], T, false));
              $current = 2;
              continue syncloop;

            case 4:
              return l;

            default:
              return;
          }
        }
      };
      $static.Empty = function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.List(T).new();
      };
      $static.CopyOf = function (other) {
        var l;
        l = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List(T).Empty();
        l.internalArray = other.internalArray.slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer));
        l.indexArray = other.indexArray.slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer));
        return l;
      };
      $static.Of = $t.markpromising(function (stream) {
        var $result;
        var $temp0;
        var $temp1;
        var item;
        var l;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                l = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List(T).Empty();
                $current = 1;
                $continue($resolve, $reject);
                return;

              case 1:
                $temp1 = stream;
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 2:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 3:
                item = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 4:
                l.Add(item);
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 5:
                $resolve(l);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $static.Concat = function (first, second) {
        var l;
        l = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List(T).Empty();
        l.internalArray = first.internalArray.slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer)).concat(second.internalArray);
        l.indexArray = first.indexArray.slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer)).concat(second.indexArray);
        return l;
      };
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.$contains = function (value) {
        var $this = this;
        return $t.fastbox($t.syncnullcompare($this.IndexOf(value), function () {
          return $t.fastbox(-1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        }).$wrapped >= 0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.$slice = function (startindex, endindex) {
        var $this = this;
        var end;
        var start;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              start = $t.syncnullcompare(startindex, function () {
                return $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              });
              end = $t.syncnullcompare(endindex, function () {
                return $this.Count();
              });
              if (start.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              start = $t.fastbox(start.$wrapped + $this.Count().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 2;
              continue syncloop;

            case 2:
              if (end.$wrapped < 0) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              end = $t.fastbox(end.$wrapped + $this.Count().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 4;
              continue syncloop;

            case 4:
              if (start.$wrapped >= end.$wrapped) {
                $current = 5;
                continue syncloop;
              } else {
                $current = 6;
                continue syncloop;
              }
              break;

            case 5:
              return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T).Empty();

            case 6:
              return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T).overArray($this.internalArray.slice(start.$wrapped, end.$wrapped));

            default:
              return;
          }
        }
      };
      $instance.$index = function (index) {
        var $this = this;
        var finalIndex;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              finalIndex = index;
              if (finalIndex.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              finalIndex = $t.fastbox($this.Count().$wrapped + index.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 2;
              continue syncloop;

            case 2:
              if ((finalIndex.$wrapped >= $this.Count().$wrapped) || (finalIndex.$wrapped < 0)) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              throw $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError.WithMessage($t.fastbox('Index is out of bounds', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 4:
              return $t.cast($this.internalArray[finalIndex.$wrapped], T, false);

            default:
              return;
          }
        }
      };
      $instance.$setindex = function (index, value) {
        var $this = this;
        var finalIndex;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              finalIndex = index;
              if (finalIndex.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              finalIndex = $t.fastbox($this.Count().$wrapped + index.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 2;
              continue syncloop;

            case 2:
              if ((finalIndex.$wrapped >= $this.Count().$wrapped) || (finalIndex.$wrapped < 0)) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              throw $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError.WithMessage($t.fastbox('Index is out of bounds', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 4:
              $this.internalArray[finalIndex.$wrapped] = value;
              return;

            default:
              return;
          }
        }
      };
      $instance.Stream = function () {
        var $this = this;
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.listStream(T).For($this);
      };
      $instance.Add = function (element) {
        var $this = this;
        $this.internalArray.push(element);
        $this.indexArray.push($t.unbox(element));
        return;
      };
      $instance.Remove = function (element) {
        var $this = this;
        var index;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              index = $this.IndexOf(element);
              if (index == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return;

            case 2:
              $this.internalArray.splice($t.unbox(index), 1);
              return;

            default:
              return;
          }
        }
      };
      $instance.IndexOf = function (element, startIndex) {
        var $this = this;
        var finalIndex;
        var foundIndex;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              finalIndex = $t.syncnullcompare(startIndex, function () {
                return $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              });
              foundIndex = $t.fastbox($this.indexArray.indexOf($t.unbox(element), finalIndex.$wrapped), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              if (foundIndex.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return null;

            case 2:
              return foundIndex;

            default:
              return;
          }
        }
      };
      $instance.Count = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.internalArray.length, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.Count().$wrapped == 0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "bool|4|9ed61ffb<2d2c9633>": true,
          "contains|4|9ed61ffb<2d2c9633>": true,
          "setindex|4|9ed61ffb<void>": true,
          "Add|2|9ed61ffb<void>": true,
          "Remove|2|9ed61ffb<void>": true,
          "IndexOf|2|9ed61ffb<6b1b3069>": true,
          "Count|3|6b1b3069": true,
          "IsEmpty|3|2d2c9633": true,
        };
        computed[("Empty|1|9ed61ffb<67d14404<" + $t.typeid(T)) + ">>"] = true;
        computed[("CopyOf|1|9ed61ffb<67d14404<" + $t.typeid(T)) + ">>"] = true;
        computed[("Of|1|9ed61ffb<67d14404<" + $t.typeid(T)) + ">>"] = true;
        computed[("Concat|1|9ed61ffb<67d14404<" + $t.typeid(T)) + ">>"] = true;
        computed[("slice|4|9ed61ffb<b92e08f7<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        computed[("Stream|2|9ed61ffb<4a88e7e1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('e4ecf032', 'Set', true, 'set', function (T) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.keyMap = $t.nativenew($global.Object)();
        instance.keys = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List(T).Empty();
        return instance;
      };
      $static.Empty = function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Set(T).new();
      };
      $instance.Add = function (item) {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.Contains(item).$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);

            case 2:
              $this.keys.Add(item);
              $this.keyMap[item.MapKey().String().$wrapped] = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              return $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);

            default:
              return;
          }
        }
      };
      $instance.Remove = function (item) {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (!$this.Contains(item).$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);

            case 2:
              $this.keys.Remove(item);
              $this.keyMap[item.MapKey().String().$wrapped] = null;
              return $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);

            default:
              return;
          }
        }
      };
      $instance.Contains = function (item) {
        var $this = this;
        return $t.fastbox(!($this.keyMap[item.MapKey().String().$wrapped] == null), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.Stream = function () {
        var $this = this;
        return $this.keys.Stream();
      };
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $this.keys.IsEmpty();
      });
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.$contains = function (value) {
        var $this = this;
        return $this.Contains(value);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Add|2|9ed61ffb<2d2c9633>": true,
          "Remove|2|9ed61ffb<2d2c9633>": true,
          "Contains|2|9ed61ffb<2d2c9633>": true,
          "IsEmpty|3|2d2c9633": true,
          "bool|4|9ed61ffb<2d2c9633>": true,
          "contains|4|9ed61ffb<2d2c9633>": true,
        };
        computed[("Empty|1|9ed61ffb<e4ecf032<" + $t.typeid(T)) + ">>"] = true;
        computed[("Stream|2|9ed61ffb<4a88e7e1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('dde47526', 'Map', true, 'map', function (T, Q) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.internalObject = $t.nativenew($global.Object)();
        instance.keys = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Set(T).Empty();
        return instance;
      };
      $static.Empty = function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map(T, Q).new();
      };
      $static.forArrays = function (keys, values) {
        var $temp0;
        var $temp1;
        var i;
        var len;
        var map;
        var tKey;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              map = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map(T, Q).new();
              len = $t.fastbox(keys.length, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              $current = 1;
              continue syncloop;

            case 1:
              $temp1 = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer.$range($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(len.$wrapped - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
              $current = 2;
              continue syncloop;

            case 2:
              $temp0 = $temp1.Next();
              i = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              tKey = $t.cast(keys[i.$wrapped], T, false);
              map.$setindex(tKey, $t.cast(values[i.$wrapped], Q, false));
              $current = 2;
              continue syncloop;

            case 4:
              return map;

            default:
              return;
          }
        }
      };
      $instance.Mapping = function () {
        var $this = this;
        return $t.fastbox($this.internalObject, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping(Q));
      };
      $instance.Keys = $t.property(function () {
        var $this = this;
        return $this.keys.Stream();
      });
      $instance.RemoveKey = function (key) {
        var $this = this;
        var keyString;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              keyString = key.MapKey().String();
              if ($this.keys.Remove(key).$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              $this.internalObject[keyString.$wrapped] = null;
              $current = 2;
              continue syncloop;

            default:
              return;
          }
        }
      };
      $instance.HasKey = function (key) {
        var $this = this;
        return $this.keys.Contains(key);
      };
      $instance.$index = function (key) {
        var $this = this;
        var keyString;
        var value;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              keyString = key.MapKey().String();
              value = $this.internalObject[keyString.$wrapped];
              if (value == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return null;

            case 2:
              return $t.cast(value, Q, false);

            default:
              return;
          }
        }
      };
      $instance.$setindex = function (key, value) {
        var $this = this;
        var keyString;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              keyString = key.MapKey().String();
              if ($this.keys.Add(key).$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              $this.internalObject[keyString.$wrapped] = value;
              $current = 2;
              continue syncloop;

            default:
              return;
          }
        }
      };
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $this.keys.IsEmpty();
      });
      $instance.$contains = function (key) {
        var $this = this;
        return $this.HasKey(key);
      };
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "RemoveKey|2|9ed61ffb<void>": true,
          "HasKey|2|9ed61ffb<2d2c9633>": true,
          "setindex|4|9ed61ffb<void>": true,
          "IsEmpty|3|2d2c9633": true,
          "contains|4|9ed61ffb<2d2c9633>": true,
          "bool|4|9ed61ffb<2d2c9633>": true,
        };
        computed[((("Empty|1|9ed61ffb<dde47526<" + $t.typeid(T)) + ",") + $t.typeid(Q)) + ">>"] = true;
        computed[("Mapping|2|9ed61ffb<a5f0d770<" + $t.typeid(Q)) + ">>"] = true;
        computed[("Keys|3|4a88e7e1<" + $t.typeid(T)) + ">"] = true;
        computed[("index|4|9ed61ffb<" + $t.typeid(Q)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('a5f0d770', 'Mapping', true, 'mapping', function (T) {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Object;
      };
      $static.Empty = function () {
        return $t.fastbox($t.nativenew($global.Object)(), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping(T));
      };
      $static.overObject = function (obj) {
        return $t.fastbox(obj, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping(T));
      };
      $instance.Keys = $t.property(function () {
        var $this = this;
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray($global.Object.keys($this.$wrapped));
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.Keys().Length().$wrapped == 0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      });
      $instance.WithEntry = $t.markpromising(function (key, value) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var copy;
        var existingKey;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                copy = $t.nativenew($global.Object)();
                $current = 1;
                $continue($resolve, $reject);
                return;

              case 1:
                $temp1 = $this.Keys().Stream();
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 2:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 3:
                existingKey = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 4:
                copy[existingKey.$wrapped] = $this.$index(existingKey);
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 5:
                copy[key.$wrapped] = value;
                $resolve($t.fastbox(copy, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping(T)));
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.$setindex = function (key, value) {
        var $this = this;
        var o;
        o = $this.$wrapped;
        o[key.$wrapped] = value;
        return;
      };
      $instance.$index = function (key) {
        var $this = this;
        var value;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              value = $this.$wrapped[key.$wrapped];
              if (value == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return null;

            case 2:
              return $t.cast(value, T, false);

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Keys|3|b92e08f7<bf97cefa>": true,
          "IsEmpty|3|2d2c9633": true,
          "bool|4|9ed61ffb<2d2c9633>": true,
          "setindex|4|9ed61ffb<void>": true,
        };
        computed[("Empty|1|9ed61ffb<a5f0d770<" + $t.typeid(T)) + ">>"] = true;
        computed[("WithEntry|2|9ed61ffb<a5f0d770<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('b92e08f7', 'Slice', true, 'slice', function (T) {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Array;
      };
      $static.Empty = function () {
        return $t.fastbox($t.nativenew($global.Array)(), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T));
      };
      $static.From = $t.markpromising(function (items) {
        var $result;
        var $temp0;
        var $temp1;
        var i;
        var s;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                s = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T).Empty();
                $current = 1;
                $continue($resolve, $reject);
                return;

              case 1:
                $temp1 = items;
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 2:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 3:
                i = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 4:
                s.$wrapped.push(i);
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 5:
                $resolve(s);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $static.ForArray = function (arr) {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T).overArray(arr);
      };
      $static.overArray = function (arr) {
        return $t.fastbox(arr, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T));
      };
      $instance.$slice = function (startindex, endindex) {
        var $this = this;
        var end;
        var start;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              start = $t.syncnullcompare(startindex, function () {
                return $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              });
              end = $t.syncnullcompare(endindex, function () {
                return $this.Length();
              });
              if (start.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              start = $t.fastbox(start.$wrapped + $this.Length().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 2;
              continue syncloop;

            case 2:
              if (end.$wrapped < 0) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              end = $t.fastbox(end.$wrapped + $this.Length().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 4;
              continue syncloop;

            case 4:
              if (start.$wrapped >= end.$wrapped) {
                $current = 5;
                continue syncloop;
              } else {
                $current = 6;
                continue syncloop;
              }
              break;

            case 5:
              return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T).Empty();

            case 6:
              return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice(T).overArray($this.$wrapped.slice(start.$wrapped, end.$wrapped));

            default:
              return;
          }
        }
      };
      $instance.$index = function (index) {
        var $this = this;
        var finalIndex;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              finalIndex = index;
              if (finalIndex.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              finalIndex = $t.fastbox($this.Length().$wrapped + index.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 2;
              continue syncloop;

            case 2:
              if ((finalIndex.$wrapped >= $this.Length().$wrapped) || (finalIndex.$wrapped < 0)) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              throw $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError.WithMessage($t.fastbox('Index is out of bounds', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 4:
              return $t.cast($this.$wrapped[finalIndex.$wrapped], T, false);

            default:
              return;
          }
        }
      };
      $instance.Stream = function () {
        var $this = this;
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.sliceStream(T).For($this);
      };
      $instance.Length = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.length, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.Length().$wrapped == 0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      });
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Length|3|6b1b3069": true,
          "IsEmpty|3|2d2c9633": true,
          "bool|4|9ed61ffb<2d2c9633>": true,
        };
        computed[("Empty|1|9ed61ffb<b92e08f7<" + $t.typeid(T)) + ">>"] = true;
        computed[("From|1|9ed61ffb<b92e08f7<" + $t.typeid(T)) + ">>"] = true;
        computed[("ForArray|1|9ed61ffb<b92e08f7<" + $t.typeid(T)) + ">>"] = true;
        computed[("slice|4|9ed61ffb<b92e08f7<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        computed[("Stream|2|9ed61ffb<4a88e7e1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.corelib.branch.master.helpertypes', function () {
    var $static = this;
    this.$class('bc4d0b5d', 'Tuple', true, 'tuple', function (T, Q) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.First = null;
        instance.Second = null;
        return instance;
      };
      $static.Build = function (first, second) {
        var tuple;
        tuple = $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple(T, Q).new();
        tuple.First = first;
        tuple.Second = second;
        return tuple;
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[((("Build|1|9ed61ffb<bc4d0b5d<" + $t.typeid(T)) + ",") + $t.typeid(Q)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('fb24d8af', 'IntStream', false, '$intstream', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (start, end, current) {
        var instance = new $static();
        instance.start = start;
        instance.end = end;
        instance.current = current;
        return instance;
      };
      $static.OverRange = function (start, end) {
        return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.IntStream.new(start, end, $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer));
      };
      $instance.Next = function () {
        var $this = this;
        var t;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.current.$wrapped <= $this.end.$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              t = $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple($g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).Build($this.current, $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
              $this.current = $t.fastbox($this.current.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              return t;

            case 2:
              return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.Tuple($g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).Build($this.current, $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "OverRange|1|9ed61ffb<fb24d8af>": true,
          "Next|2|9ed61ffb<bc4d0b5d<6b1b3069,2d2c9633>>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('21a7ba09', 'SimpleError', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.String;
      };
      $static.WithMessage = function (message) {
        return $t.box(message, $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError);
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "WithMessage|1|9ed61ffb<21a7ba09>": true,
          "Message|3|bf97cefa": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.corelib.branch.master.interfaces', function () {
    var $static = this;
    this.$interface('e5148fe5', 'Stringable', false, 'stringable', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('4a88e7e1', 'Stream', true, 'stream', function (T) {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Next|2|9ed61ffb<bc4d0b5d<" + $t.typeid(T)) + ",2d2c9633>>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('538a2aff', 'Streamable', true, 'streamable', function (T) {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Stream|2|9ed61ffb<4a88e7e1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('4c510009', 'Mappable', false, 'mappable', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "MapKey|3|e5148fe5": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('36b1f64d', 'Awaitable', true, 'awaitable', function (T) {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Then|2|9ed61ffb<36b1f64d<" + $t.typeid(T)) + ">>"] = true;
        computed[("Catch|2|9ed61ffb<36b1f64d<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('c8fb698e', 'Error', false, 'error', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Message|3|bf97cefa": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('eaa5fab2', 'Releasable', false, 'releasable', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Release|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.MapStream = function (T, Q) {
      var $f = function (stream, mapper) {
        var $result;
        var $temp0;
        var $temp1;
        var item;
        var $current = 0;
        var $continue = function ($yield, $yieldin, $reject, $done) {
          while (true) {
            switch ($current) {
              case 0:
                $current = 1;
                $continue($yield, $yieldin, $reject, $done);
                return;

              case 1:
                $temp1 = stream;
                $current = 2;
                $continue($yield, $yieldin, $reject, $done);
                return;

              case 2:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 3;
                  $continue($yield, $yieldin, $reject, $done);
                  return;
                }).catch(function (err) {
                  throw err;
                });
                return;

              case 3:
                item = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 4;
                  $continue($yield, $yieldin, $reject, $done);
                  return;
                } else {
                  $current = 6;
                  $continue($yield, $yieldin, $reject, $done);
                  return;
                }
                break;

              case 4:
                $yield(mapper(item));
                $current = 5;
                return;

              case 5:
                $current = 2;
                $continue($yield, $yieldin, $reject, $done);
                return;

              default:
                $done();
                return;
            }
          }
        };
        return $generator.new($continue, true);
      };
      return $f;
    };
  });
  $module('pkg.github.com.Serulian.corelib.branch.master.primitives', function () {
    var $static = this;
    this.$class('9ed61ffb', 'functionType', true, 'function', function (T) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        return instance;
      };
      this.$typesig = function () {
        return {
        };
      };
    });

    this.$type('6b1b3069', 'Integer', false, 'int', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Number;
      };
      $static.$range = function (start, end) {
        return $g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.IntStream.OverRange(start, end);
      };
      $static.$plus = function (left, right) {
        return $t.fastbox(left.$wrapped + right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      $static.$minus = function (left, right) {
        return $t.fastbox(left.$wrapped - right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      $static.$times = function (left, right) {
        return $t.fastbox(left.$wrapped * right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      $static.$div = function (left, right) {
        return $t.fastbox(left.$wrapped / right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64).Floor();
      };
      $static.$mod = function (left, right) {
        return $t.fastbox(left.$wrapped % right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      $static.$compare = function (left, right) {
        return $t.fastbox(left.$wrapped - right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $static.$equals = function (left, right) {
        return $t.box(left.$wrapped == right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.String = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toString(), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $instance.MapKey = $t.property(function () {
        var $this = this;
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($t.fastbox('int::', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $this.String());
      });
      $instance.AsFloat = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "range|4|9ed61ffb<4a88e7e1<6b1b3069>>": true,
          "plus|4|9ed61ffb<6b1b3069>": true,
          "minus|4|9ed61ffb<6b1b3069>": true,
          "times|4|9ed61ffb<6b1b3069>": true,
          "div|4|9ed61ffb<6b1b3069>": true,
          "mod|4|9ed61ffb<6b1b3069>": true,
          "compare|4|9ed61ffb<6b1b3069>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
          "MapKey|3|e5148fe5": true,
          "AsFloat|2|9ed61ffb<0cd0c402>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('0cd0c402', 'Float64', false, 'float64', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Number;
      };
      $instance.String = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toString(), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $static.$plus = function (left, right) {
        return $t.fastbox(left.$wrapped + right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64);
      };
      $static.$minus = function (left, right) {
        return $t.fastbox(left.$wrapped - right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64);
      };
      $static.$times = function (left, right) {
        return $t.fastbox(left.$wrapped * right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64);
      };
      $static.$div = function (left, right) {
        return $t.fastbox(left.$wrapped / right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64);
      };
      $static.$equals = function (left, right) {
        return $t.box(left.$wrapped == right.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $static.$compare = function (left, right) {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Float64.$minus(left, right).Floor();
      };
      $instance.Floor = function () {
        var $this = this;
        return $t.fastbox($global.Math.floor($this.$wrapped), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      $instance.Ceil = function () {
        var $this = this;
        return $t.fastbox($global.Math.ceil($this.$wrapped), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      $instance.Round = function () {
        var $this = this;
        return $t.fastbox($global.Math.round($this.$wrapped), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "String|2|9ed61ffb<bf97cefa>": true,
          "plus|4|9ed61ffb<0cd0c402>": true,
          "minus|4|9ed61ffb<0cd0c402>": true,
          "times|4|9ed61ffb<0cd0c402>": true,
          "div|4|9ed61ffb<0cd0c402>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "compare|4|9ed61ffb<6b1b3069>": true,
          "Floor|2|9ed61ffb<6b1b3069>": true,
          "Ceil|2|9ed61ffb<6b1b3069>": true,
          "Round|2|9ed61ffb<6b1b3069>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('2d2c9633', 'Boolean', false, 'bool', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Boolean;
      };
      $instance.String = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toString(), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $static.$equals = function (first, second) {
        return $t.box(first.$wrapped == second.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $static.$bool = function (value) {
        return value;
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "String|2|9ed61ffb<bf97cefa>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "bool|4|9ed61ffb<2d2c9633>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('bf97cefa', 'String', false, 'string', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.String;
      };
      $static.$equals = function (first, second) {
        return $t.box(first.$wrapped == second.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $static.$plus = function (first, second) {
        return $t.fastbox(first.$wrapped + second.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $instance.$slice = function (startindex, endindex) {
        var $this = this;
        var end;
        var start;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              start = $t.syncnullcompare(startindex, function () {
                return $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              });
              end = $t.syncnullcompare(endindex, function () {
                return $this.Length();
              });
              if (start.$wrapped < 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              start = $t.fastbox(start.$wrapped + $this.Length().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 2;
              continue syncloop;

            case 2:
              if (end.$wrapped < 0) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              end = $t.fastbox(end.$wrapped + $this.Length().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 4;
              continue syncloop;

            case 4:
              if (start.$wrapped >= end.$wrapped) {
                $current = 5;
                continue syncloop;
              } else {
                $current = 6;
                continue syncloop;
              }
              break;

            case 5:
              return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

            case 6:
              return $t.fastbox($this.$wrapped.substring(start.$wrapped, end.$wrapped), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

            default:
              return;
          }
        }
      };
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.Trim = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.trim(), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $instance.ToLowerCase = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toLowerCase(), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $instance.Split = function (separator, limit) {
        var $this = this;
        var arr;
        arr = $this.$wrapped.split(separator.$wrapped, $t.syncnullcompare(limit, function () {
          return $t.fastbox(-1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        }).$wrapped);
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).ForArray(arr);
      };
      $instance.HasPrefix = function (prefix) {
        var $this = this;
        return $t.fastbox($this.$wrapped.indexOf(prefix.$wrapped) == 0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      };
      $instance.String = function () {
        var $this = this;
        return $this;
      };
      $instance.MapKey = $t.property(function () {
        var $this = this;
        return $this;
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.Length().$wrapped == 0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      });
      $instance.Length = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.length, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "equals|4|9ed61ffb<2d2c9633>": true,
          "plus|4|9ed61ffb<bf97cefa>": true,
          "slice|4|9ed61ffb<bf97cefa>": true,
          "bool|4|9ed61ffb<2d2c9633>": true,
          "Trim|2|9ed61ffb<bf97cefa>": true,
          "ToLowerCase|2|9ed61ffb<bf97cefa>": true,
          "Split|2|9ed61ffb<b92e08f7<bf97cefa>>": true,
          "HasPrefix|2|9ed61ffb<2d2c9633>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
          "MapKey|3|e5148fe5": true,
          "IsEmpty|3|2d2c9633": true,
          "Length|3|6b1b3069": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.formatTemplateString = function (pieces, values) {
      var $temp0;
      var $temp1;
      var i;
      var overallPieces;
      var $current = 0;
      syncloop: while (true) {
        switch ($current) {
          case 0:
            overallPieces = $t.nativenew($global.Array)();
            $current = 1;
            continue syncloop;

          case 1:
            $temp1 = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer.$range($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(pieces.Length().$wrapped - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
            $current = 2;
            continue syncloop;

          case 2:
            $temp0 = $temp1.Next();
            i = $temp0.First;
            if ($temp0.Second.$wrapped) {
              $current = 3;
              continue syncloop;
            } else {
              $current = 6;
              continue syncloop;
            }
            break;

          case 3:
            overallPieces.push(pieces.$index(i).$wrapped);
            if (i.$wrapped < values.Length().$wrapped) {
              $current = 4;
              continue syncloop;
            } else {
              $current = 5;
              continue syncloop;
            }
            break;

          case 4:
            overallPieces.push(values.$index(i).String().$wrapped);
            $current = 5;
            continue syncloop;

          case 5:
            $current = 2;
            continue syncloop;

          case 6:
            return $t.fastbox(overallPieces.join(''), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

          default:
            return;
        }
      }
    };
  });
  $module('pkg.github.com.Serulian.corelib.branch.master.promise', function () {
    var $static = this;
    this.$type('9d5b10f8', 'Promise', true, 'promise', function (T) {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Promise;
      };
      $static.Execute = function (handler) {
        var native;
        native = $t.nativenew($global.Promise)(function (resolveNow, rejectNow) {
          handler(function (value) {
            resolveNow.call(null, value);
            return;
          }, function (err) {
            rejectNow.call(null, err);
            return;
          });
          return;
        });
        return $t.fastbox(native, $g.pkg.github.com.Serulian.corelib.branch.master.promise.Promise(T));
      };
      $instance.Then = function (callback) {
        var $this = this;
        $this.$wrapped.then(callback);
        return $this;
      };
      $instance.Catch = function (callback) {
        var $this = this;
        $this.$wrapped.catch(callback);
        return $this;
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Execute|1|9ed61ffb<9d5b10f8<" + $t.typeid(T)) + ">>"] = true;
        computed[("Then|2|9ed61ffb<36b1f64d<" + $t.typeid(T)) + ">>"] = true;
        computed[("Catch|2|9ed61ffb<36b1f64d<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.corelib.branch.master.serialization', function () {
    var $static = this;
    this.$class('f91066da', 'JSON', false, 'json', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        return instance;
      };
      $static.Get = function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.serialization.JSON.new();
      };
      $instance.Stringify = function (value) {
        var $this = this;
        return $t.fastbox($global.JSON.stringify(value.$wrapped, $t.dynamicaccess($global.__serulian_internal, 'autoUnbox', false)), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      };
      $instance.Parse = function (value) {
        var $this = this;
        return $t.fastbox($global.JSON.parse(value.$wrapped, $t.dynamicaccess($global.__serulian_internal, 'autoBox', false)), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any));
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Get|1|9ed61ffb<f91066da>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Parse|2|9ed61ffb<a5f0d770<any>>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('afbf62c3', 'Stringifier', false, '$stringifier', function () {
      var $static = this;
      $static.Get = function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.serialization.JSON.new();
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Get|1|9ed61ffb<afbf62c3>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('91afb23b', 'Parser', false, '$parser', function () {
      var $static = this;
      $static.Get = function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.serialization.JSON.new();
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Get|1|9ed61ffb<91afb23b>": true,
          "Parse|2|9ed61ffb<a5f0d770<any>>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.request.HEAD.request', function () {
    var $static = this;
    this.$class('3f4a606f', 'HttpError', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (response) {
        var instance = new $static();
        instance.response = response;
        return instance;
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("Got non-OK response: ", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox(": ", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([$this.response.StatusCode(), $this.response.StatusText()]));
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Message|3|bf97cefa": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('8e2b8923', 'RequestError', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        return instance;
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $t.fastbox('An error occurred when constructing the request', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Message|3|bf97cefa": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('7ec92d6e', 'Request', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (method, url) {
        var instance = new $static();
        instance.method = method;
        instance.url = url;
        return instance;
      };
      $static.For = function (method, url) {
        return $g.pkg.github.com.Serulian.request.HEAD.request.Request.new(method, url);
      };
      $instance.WithBody = function (body) {
        var $this = this;
        $this.body = body;
        return $this;
      };
      $instance.ExecuteAndReturn = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.corelib.branch.master.promise.Promise($g.pkg.github.com.Serulian.request.HEAD.request.Response).Execute(function (resolve, rejectNow) {
                  var body;
                  var xhr;
                  var $current = 0;
                  syncloop: while (true) {
                    switch ($current) {
                      case 0:
                        xhr = $t.nativenew($global.XMLHttpRequest)();
                        xhr.open($t.unbox($this.method), $t.unbox($this.url));
                        xhr.addEventListener('load', function () {
                          var $current = 0;
                          syncloop: while (true) {
                            switch ($current) {
                              case 0:
                                if (xhr.readyState == 4) {
                                  $current = 1;
                                  continue syncloop;
                                } else {
                                  $current = 2;
                                  continue syncloop;
                                }
                                break;

                              case 1:
                                resolve($t.box($g.pkg.github.com.Serulian.request.HEAD.request.responseData.new($t.fastbox(xhr.status, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(xhr.statusText, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox(xhr.responseText, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), $g.pkg.github.com.Serulian.request.HEAD.request.Response));
                                $current = 2;
                                continue syncloop;

                              default:
                                return;
                            }
                          }
                        });
                        xhr.addEventListener('error', function () {
                          rejectNow($g.pkg.github.com.Serulian.request.HEAD.request.RequestError.new());
                          return;
                        });
                        body = $this.body;
                        if (body != null) {
                          $current = 1;
                          continue syncloop;
                        } else {
                          $current = 2;
                          continue syncloop;
                        }
                        break;

                      case 1:
                        xhr.send(body.$wrapped);
                        $current = 2;
                        continue syncloop;

                      default:
                        return;
                    }
                  }
                })).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 1:
                $resolve($result);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.Execute = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.ExecuteAndReturn()).then(function ($result1) {
                  return $promise.translate($result1).then(function ($result0) {
                    $result = $result0;
                    $current = 1;
                    $continue($resolve, $reject);
                    return;
                  });
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 1:
                $resolve($result);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "For|1|9ed61ffb<7ec92d6e>": true,
          "WithBody|2|9ed61ffb<7ec92d6e>": true,
          "ExecuteAndReturn|2|9ed61ffb<9d5b10f8<92042472>>": true,
          "Execute|2|9ed61ffb<92042472>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('92042472', 'Response', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $g.pkg.github.com.Serulian.request.HEAD.request.responseData;
      };
      $instance.StatusCode = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.request.HEAD.request.responseData).StatusCode;
      });
      $instance.StatusText = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.request.HEAD.request.responseData).StatusText;
      });
      $instance.Text = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.request.HEAD.request.responseData).Text;
      });
      $instance.RejectOnFailure = function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (($this.StatusCode().$wrapped / 100) != 2) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              throw $g.pkg.github.com.Serulian.request.HEAD.request.HttpError.new($this);

            case 2:
              return $this;

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "StatusCode|3|6b1b3069": true,
          "StatusText|3|bf97cefa": true,
          "Text|3|bf97cefa": true,
          "RejectOnFailure|2|9ed61ffb<92042472>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('20309971', 'responseData', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (StatusCode, StatusText, Text) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          StatusCode: StatusCode,
          StatusText: StatusText,
          Text: Text,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'StatusCode', 'StatusCode', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer;
      }, false);
      $t.defineStructField($static, 'StatusText', 'StatusText', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'Text', 'Text', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<20309971>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<20309971>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.Get = $t.markpromising(function (url) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Request.For($t.fastbox('GET', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), url).Execute()).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.Post = $t.markpromising(function (url, body) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Request.For($t.fastbox('POST', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), url).WithBody(body).Execute()).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.Put = $t.markpromising(function (url, body) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Request.For($t.fastbox('PUT', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), url).WithBody(body).Execute()).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.Patch = $t.markpromising(function (url, body) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Request.For($t.fastbox('PATCH', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), url).WithBody(body).Execute()).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.Delete = $t.markpromising(function (url) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Request.For($t.fastbox('DELETE', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), url).Execute()).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.GetURLContents = $t.markpromising(function (url) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Get(url)).then(function ($result0) {
                $result = $result0.RejectOnFailure().Text();
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.decorators', function () {
    var $static = this;
    this.$class('de46b14b', 'elementRenderer', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (decorator) {
        var instance = new $static();
        instance.decorator = decorator;
        return instance;
      };
      $instance.Render = $t.markpromising(function (context) {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.RenderToVirtualNode($this.value, context)).then(function ($result0) {
                  $result = $this.decorator($result0);
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 1:
                $resolve($result);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|9ed61ffb<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.If = function (value, condition) {
      var $temp0;
      return condition.$wrapped ? value : ($temp0 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Text = $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0);
    };
    $static.DynamicAttributes = $t.markpromising(function (value, attributes) {
      var $result;
      var $temp0;
      var $temp1;
      var attributeName;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $current = 1;
              $continue($resolve, $reject);
              return;

            case 1:
              $temp1 = attributes.Keys();
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 2:
              $promise.maybe($temp1.Next()).then(function ($result0) {
                $temp0 = $result0;
                $result = $temp0;
                $current = 3;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 3:
              attributeName = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 4;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 8;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 4:
              if ($t.syncnullcompare(attributes.$index(attributeName), function () {
                return $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              }).$wrapped) {
                $current = 5;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 7;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 5:
              $promise.maybe(value.props.WithEntry(attributeName, $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean))).then(function ($result0) {
                $result = value.props = $result0;
                $current = 6;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 6:
              $current = 7;
              $continue($resolve, $reject);
              return;

            case 7:
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 8:
              $resolve(value);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.HideIf = $t.markpromising(function (value, condition) {
      var $temp0;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        $resolve(($temp0 = $g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.elementRenderer.new($t.markpromising(function (virtualNode) {
          var $result;
          var $current = 0;
          var $continue = function ($resolve, $reject) {
            while (true) {
              switch ($current) {
                case 0:
                  if (!condition.$wrapped) {
                    $current = 1;
                    $continue($resolve, $reject);
                    return;
                  } else {
                    $current = 2;
                    $continue($resolve, $reject);
                    return;
                  }
                  break;

                case 1:
                  $resolve(virtualNode);
                  return;

                case 2:
                  $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.addStyle(virtualNode, $t.fastbox('display', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox('none', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String))).then(function ($result0) {
                    $result = $result0;
                    $current = 3;
                    $continue($resolve, $reject);
                    return;
                  }).catch(function (err) {
                    $reject(err);
                    return;
                  });
                  return;

                case 3:
                  $resolve($result);
                  return;

                default:
                  $resolve();
                  return;
              }
            }
          };
          return $promise.new($continue);
        })), $temp0.value = value, $temp0));
        return;
      };
      return $promise.new($continue);
    });
    $static.addStyle = $t.markpromising(function (virtualNode, styleName, styleValue) {
      var $result;
      var $temp0;
      var attributes;
      var styleString;
      var updated;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              attributes = $t.syncnullcompare(virtualNode.Attributes, function () {
                return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty();
              });
              styleString = $t.syncnullcompare(attributes.$index($t.fastbox('style', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), function () {
                return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              });
              if (!styleString.IsEmpty().$wrapped) {
                $current = 1;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 2;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 1:
              styleString = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus(styleString, $t.fastbox('; ', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 2:
              $promise.maybe(attributes.WithEntry($t.fastbox('style', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox(": ", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([styleString, styleName, styleValue])))).then(function ($result0) {
                $result = $result0;
                $current = 3;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 3:
              updated = $result;
              $resolve(($temp0 = virtualNode.Clone(), $temp0.Attributes = updated, $temp0));
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.diff', function () {
    var $static = this;
    this.$interface('0c7678d3', 'DiffReporter', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "NodeRemoved|2|9ed61ffb<void>": true,
          "NodeCreated|2|9ed61ffb<void>": true,
          "NodeUpdated|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('9e7920f2', 'AttributeDiff', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (Name) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          Name: Name,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'Name', 'Name', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'Value', 'Value', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<9e7920f2>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<9e7920f2>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('6f012821', 'Diff', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (Type, NodeIndex, Children, Attributes) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          Type: Type,
          NodeIndex: NodeIndex,
          Children: Children,
          Attributes: Attributes,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'Type', 'Type', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'NodeIndex', 'NodeIndex', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer;
      }, false);
      $t.defineStructField($static, 'ReplacementNode', 'ReplacementNode', function () {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode;
      }, function () {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode;
      }, true);
      $t.defineStructField($static, 'Children', 'Children', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff);
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff);
      }, false);
      $t.defineStructField($static, 'Attributes', 'Attributes', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff);
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff);
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<6f012821>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<6f012821>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.generateId = function () {
      $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.nodeCounter = $t.fastbox($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.nodeCounter.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.nodeCounter.String();
    };
    $static.buildDOM = $t.markpromising(function (vNode, parentPath, reporter) {
      var $result;
      var $temp0;
      var $temp1;
      var $temp2;
      var $temp3;
      var attrName;
      var attrValue;
      var attributes;
      var built;
      var child;
      var children;
      var elementPath;
      var node;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              if (vNode.TagName == null) {
                $current = 1;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 2;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 1:
              $resolve($global.document.createTextNode($t.assertnotnull(vNode.Text).$wrapped));
              return;

            case 2:
              node = $global.document.createElement($t.assertnotnull(vNode.TagName).$wrapped);
              if (vNode.Key != null) {
                $current = 3;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 4;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 3:
              $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.keyAttachment.Set(node, $t.assertnotnull(vNode.Key));
              $current = 4;
              $continue($resolve, $reject);
              return;

            case 4:
              attributes = vNode.Attributes;
              if (attributes != null) {
                $current = 5;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 13;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 5:
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 6:
              $temp1 = attributes.Keys().Stream();
              $current = 7;
              $continue($resolve, $reject);
              return;

            case 7:
              $promise.maybe($temp1.Next()).then(function ($result0) {
                $temp0 = $result0;
                $result = $temp0;
                $current = 8;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 8:
              attrName = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 9;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 12;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 9:
              attrValue = attributes.$index(attrName);
              if (attrValue == null) {
                $current = 10;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 11;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 10:
              $current = 7;
              $continue($resolve, $reject);
              return;

            case 11:
              node.setAttribute(attrName.$wrapped, $t.assertnotnull(attrValue).$wrapped);
              $current = 7;
              $continue($resolve, $reject);
              return;

            case 12:
              $current = 13;
              $continue($resolve, $reject);
              return;

            case 13:
              elementPath = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus(parentPath, $t.fastbox('.', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.generateId());
              $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.setDOMPath(node, elementPath);
              children = vNode.Children;
              if (children != null) {
                $current = 14;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 22;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 14:
              $current = 15;
              $continue($resolve, $reject);
              return;

            case 15:
              $temp3 = children.Stream();
              $current = 16;
              $continue($resolve, $reject);
              return;

            case 16:
              $promise.maybe($temp3.Next()).then(function ($result0) {
                $temp2 = $result0;
                $result = $temp2;
                $current = 17;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 17:
              child = $temp2.First;
              if ($temp2.Second.$wrapped) {
                $current = 18;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 21;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 18:
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.buildDOM(child, elementPath, reporter)).then(function ($result0) {
                $result = $result0;
                $current = 19;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 19:
              built = $result;
              node.appendChild(built);
              $t.nullableinvoke(reporter, 'NodeCreated', true, [child, built]).then(function ($result0) {
                $result = $result0;
                $current = 20;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 20:
              $current = 16;
              $continue($resolve, $reject);
              return;

            case 21:
              $current = 22;
              $continue($resolve, $reject);
              return;

            case 22:
              $resolve(node);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.ComputeDiff = $t.markpromising(function (updated, existing) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.computeDiff(updated, existing, $t.fastbox(-1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer))).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              $resolve($result);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.ApplyDiff = $t.markpromising(function (diff, domNode, reporter) {
      var $result;
      var $temp0;
      var $temp1;
      var $temp2;
      var $temp3;
      var $temp4;
      var attrDiff;
      var child;
      var childDiff;
      var createdNode;
      var existingChild;
      var insertionBeforeIndex;
      var parent;
      var parentPath;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $temp0 = diff.Type;
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($temp0, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_SAME).$wrapped) {
                $current = 1;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 3;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 1:
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 3:
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($temp0, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_THUNK).$wrapped) {
                $current = 4;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 25;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 4:
              $current = 5;
              $continue($resolve, $reject);
              return;

            case 5:
              $temp2 = diff.Attributes.Stream();
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 6:
              $promise.maybe($temp2.Next()).then(function ($result0) {
                $temp1 = $result0;
                $result = $temp1;
                $current = 7;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 7:
              attrDiff = $temp1.First;
              if ($temp1.Second.$wrapped) {
                $current = 8;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 12;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 8:
              if (attrDiff.Value == null) {
                $current = 9;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 11;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 9:
              $t.cast(domNode, $global.Element, false).removeAttribute(attrDiff.Name.$wrapped);
              $current = 10;
              $continue($resolve, $reject);
              return;

            case 10:
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 11:
              $t.cast(domNode, $global.Element, false).setAttribute(attrDiff.Name.$wrapped, $t.assertnotnull(attrDiff.Value).$wrapped);
              $current = 10;
              $continue($resolve, $reject);
              return;

            case 12:
              $t.nullableinvoke(reporter, 'NodeUpdated', true, [$t.assertnotnull(diff.ReplacementNode), domNode]).then(function ($result0) {
                $result = $result0;
                $current = 13;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 13:
              $current = 14;
              $continue($resolve, $reject);
              return;

            case 14:
              $temp4 = diff.Children.Stream();
              $current = 15;
              $continue($resolve, $reject);
              return;

            case 15:
              $promise.maybe($temp4.Next()).then(function ($result0) {
                $temp3 = $result0;
                $result = $temp3;
                $current = 16;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 16:
              childDiff = $temp3.First;
              if ($temp3.Second.$wrapped) {
                $current = 17;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 24;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 17:
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals(childDiff.Type, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_CREATE_NODE).$wrapped) {
                $current = 18;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 20;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 18:
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ApplyDiff(childDiff, domNode, reporter)).then(function ($result0) {
                $result = $result0;
                $current = 19;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 19:
              $current = 15;
              $continue($resolve, $reject);
              return;

            case 20:
              child = $t.cast(domNode, $global.Element, false).childNodes[childDiff.NodeIndex.$wrapped];
              if (child == null) {
                $current = 21;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 22;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 21:
              $reject($g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.DOMError.WithMessage($t.fastbox('Missing expected child', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)));
              return;

            case 22:
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ApplyDiff(childDiff, $t.assertnotnull(child), reporter)).then(function ($result0) {
                $result = $result0;
                $current = 23;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 23:
              $current = 15;
              $continue($resolve, $reject);
              return;

            case 24:
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 25:
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($temp0, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_REMOVE_NODE).$wrapped) {
                $current = 26;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 29;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 26:
              parent = domNode.parentNode;
              if (parent != null) {
                $current = 27;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 28;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 27:
              parent.removeChild(domNode);
              $t.nullableinvoke(reporter, 'NodeRemoved', false, [domNode]);
              $current = 28;
              $continue($resolve, $reject);
              return;

            case 28:
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 29:
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($temp0, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_CREATE_NODE).$wrapped) {
                $current = 30;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 38;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 30:
              parentPath = $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.buildDOM($t.assertnotnull(diff.ReplacementNode), parentPath, reporter)).then(function ($result0) {
                $result = $result0;
                $current = 31;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 31:
              createdNode = $result;
              insertionBeforeIndex = diff.NodeIndex;
              if (insertionBeforeIndex.$wrapped >= domNode.childNodes.length) {
                $current = 32;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 34;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 32:
              domNode.appendChild(createdNode);
              $t.nullableinvoke(reporter, 'NodeCreated', true, [$t.assertnotnull(diff.ReplacementNode), createdNode]).then(function ($result0) {
                $result = $result0;
                $current = 33;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 33:
              $resolve();
              return;

            case 34:
              existingChild = domNode.childNodes[insertionBeforeIndex.$wrapped];
              if (existingChild != null) {
                $current = 35;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 37;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 35:
              domNode.insertBefore(createdNode, existingChild);
              $t.nullableinvoke(reporter, 'NodeCreated', true, [$t.assertnotnull(diff.ReplacementNode), createdNode]).then(function ($result0) {
                $result = $result0;
                $current = 36;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 36:
              $current = 37;
              $continue($resolve, $reject);
              return;

            case 37:
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 38:
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($temp0, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_REPLACE_NODE).$wrapped) {
                $current = 39;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 2;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 39:
              parent = domNode.parentNode;
              if (parent != null) {
                $current = 40;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 43;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 40:
              parentPath = $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.buildDOM($t.assertnotnull(diff.ReplacementNode), parentPath, reporter)).then(function ($result0) {
                $result = $result0;
                $current = 41;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 41:
              createdNode = $result;
              parent.replaceChild(createdNode, domNode);
              $t.nullableinvoke(reporter, 'NodeCreated', true, [$t.assertnotnull(diff.ReplacementNode), createdNode]).then(function ($result0) {
                $result = $result0;
                $current = 42;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 42:
              $t.nullableinvoke(reporter, 'NodeRemoved', false, [domNode]);
              $current = 43;
              $continue($resolve, $reject);
              return;

            case 43:
              $current = 2;
              $continue($resolve, $reject);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.getInferredNodeKey = function (node, index) {
      var $current = 0;
      syncloop: while (true) {
        switch ($current) {
          case 0:
            if (node.Key() != null) {
              $current = 1;
              continue syncloop;
            } else {
              $current = 2;
              continue syncloop;
            }
            break;

          case 1:
            return $t.assertnotnull(node.Key());

          case 2:
            if (node.IsElement().$wrapped) {
              $current = 3;
              continue syncloop;
            } else {
              $current = 4;
              continue syncloop;
            }
            break;

          case 3:
            return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus(node.TagName(), $t.fastbox(':', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), index.String());

          case 4:
            return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($t.assertnotnull(node.TextData()), $t.fastbox(':', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), index.String());

          default:
            return;
        }
      }
    };
    $static.computeDiff = $t.markpromising(function (updatedNode, existing, parentIndex) {
      var $result;
      var $temp0;
      var $temp1;
      var $temp10;
      var $temp11;
      var $temp12;
      var $temp13;
      var $temp14;
      var $temp2;
      var $temp3;
      var $temp4;
      var $temp5;
      var $temp6;
      var $temp7;
      var $temp8;
      var $temp9;
      var addCreate;
      var attributeDiffs;
      var attributeName;
      var attributeValue;
      var child;
      var childInPlaceDiffs;
      var childInsertionDiffs;
      var childKey;
      var childRemovalDiffs;
      var childrenDiffs;
      var counter;
      var existingAttributes;
      var existingKey;
      var existingValue;
      var existingVirtual;
      var handledDiff;
      var index;
      var keysHandled;
      var needsReplacement;
      var updated;
      var updatedByKey;
      var updatedChildren;
      var updatedKey;
      var vNode;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              existingVirtual = existing.Virtual();
              if (existingVirtual != null) {
                $current = 1;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 4;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 1:
              if ($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.$equals(existingVirtual, updatedNode).$wrapped) {
                $current = 2;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 3;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 2:
              $resolve(($temp0 = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_SAME, parentIndex, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()), $temp0.ReplacementNode = updatedNode, $temp0));
              return;

            case 3:
              $current = 4;
              $continue($resolve, $reject);
              return;

            case 4:
              updated = $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(updatedNode);
              updatedKey = $t.syncnullcompare(updated.Key(), function () {
                return $t.fastbox('---updating---', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              });
              existingKey = $t.syncnullcompare(existing.Key(), function () {
                return $t.fastbox('---existing--', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              });
              needsReplacement = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals(updatedKey, existingKey).$wrapped) {
                $current = 5;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 52;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 5:
              needsReplacement = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 6:
              if (needsReplacement.$wrapped) {
                $current = 7;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 8;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 7:
              $resolve(($temp1 = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_REPLACE_NODE, parentIndex, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()), $temp1.ReplacementNode = updatedNode, $temp1));
              return;

            case 8:
              attributeDiffs = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff).Empty();
              if (existing.IsElement().$wrapped) {
                $current = 9;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 27;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 9:
              existingAttributes = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty();
              $current = 10;
              $continue($resolve, $reject);
              return;

            case 10:
              $promise.maybe(existing.AttributeNames()).then(function ($result0) {
                $result = $result0.Stream();
                $current = 11;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 11:
              $temp3 = $result;
              $current = 12;
              $continue($resolve, $reject);
              return;

            case 12:
              $promise.maybe($temp3.Next()).then(function ($result0) {
                $temp2 = $result0;
                $result = $temp2;
                $current = 13;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 13:
              attributeName = $temp2.First;
              if ($temp2.Second.$wrapped) {
                $current = 14;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 17;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 14:
              existingAttributes.$setindex(attributeName, existing.GetAttribute(attributeName));
              if (updated.GetAttribute(attributeName) == null) {
                $current = 15;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 16;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 15:
              attributeDiffs.Add($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff.new(attributeName));
              $current = 16;
              $continue($resolve, $reject);
              return;

            case 16:
              $current = 12;
              $continue($resolve, $reject);
              return;

            case 17:
              $current = 18;
              $continue($resolve, $reject);
              return;

            case 18:
              $temp5 = updated.AttributeNames().Stream();
              $current = 19;
              $continue($resolve, $reject);
              return;

            case 19:
              $promise.maybe($temp5.Next()).then(function ($result0) {
                $temp4 = $result0;
                $result = $temp4;
                $current = 20;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 20:
              attributeName = $temp4.First;
              if ($temp4.Second.$wrapped) {
                $current = 21;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 26;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 21:
              attributeValue = updated.GetAttribute(attributeName);
              existingValue = existingAttributes.$index(attributeName);
              if (attributeValue == null) {
                $current = 22;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 23;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 22:
              $current = 19;
              $continue($resolve, $reject);
              return;

            case 23:
              if ((existingValue == null) || !$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($t.assertnotnull(attributeValue), $t.assertnotnull(existingValue)).$wrapped) {
                $current = 24;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 25;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 24:
              attributeDiffs.Add(($temp6 = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff.new(attributeName), $temp6.Value = attributeValue, $temp6));
              $current = 25;
              $continue($resolve, $reject);
              return;

            case 25:
              $current = 19;
              $continue($resolve, $reject);
              return;

            case 26:
              $current = 27;
              $continue($resolve, $reject);
              return;

            case 27:
              childInPlaceDiffs = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty();
              childRemovalDiffs = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty();
              childInsertionDiffs = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty();
              updatedByKey = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Empty();
              keysHandled = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty();
              index = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              updatedChildren = updatedNode.Children;
              if (updatedChildren != null) {
                $current = 28;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 34;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 28:
              $current = 29;
              $continue($resolve, $reject);
              return;

            case 29:
              $temp8 = updatedChildren.Stream();
              $current = 30;
              $continue($resolve, $reject);
              return;

            case 30:
              $promise.maybe($temp8.Next()).then(function ($result0) {
                $temp7 = $result0;
                $result = $temp7;
                $current = 31;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 31:
              child = $temp7.First;
              if ($temp7.Second.$wrapped) {
                $current = 32;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 33;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 32:
              updatedByKey.$setindex($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.getInferredNodeKey($g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(child), index), child);
              index = $t.fastbox(index.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 30;
              $continue($resolve, $reject);
              return;

            case 33:
              $current = 34;
              $continue($resolve, $reject);
              return;

            case 34:
              $current = 35;
              $continue($resolve, $reject);
              return;

            case 35:
              $temp10 = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer.$range($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(existing.ChildCount().$wrapped - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
              $current = 36;
              $continue($resolve, $reject);
              return;

            case 36:
              $temp9 = $temp10.Next();
              counter = $temp9.First;
              if ($temp9.Second.$wrapped) {
                $current = 37;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 41;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 37:
              index = $t.fastbox((existing.ChildCount().$wrapped - 1) - counter.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              child = existing.GetChild(index);
              childKey = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.getInferredNodeKey(child, index);
              vNode = updatedByKey.$index(childKey);
              if (vNode == null) {
                $current = 38;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 39;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 38:
              childRemovalDiffs.Add($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_REMOVE_NODE, index, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()));
              $current = 36;
              $continue($resolve, $reject);
              return;

            case 39:
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.computeDiff($t.assertnotnull(vNode), child, index)).then(function ($result0) {
                $result = keysHandled.$setindex(childKey, $result0);
                $current = 40;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 40:
              $current = 36;
              $continue($resolve, $reject);
              return;

            case 41:
              updatedChildren = updatedNode.Children;
              if (updatedChildren != null) {
                $current = 42;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 51;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 42:
              $current = 43;
              $continue($resolve, $reject);
              return;

            case 43:
              $temp12 = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer.$range($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(updatedChildren.Length().$wrapped - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
              $current = 44;
              $continue($resolve, $reject);
              return;

            case 44:
              $temp11 = $temp12.Next();
              index = $temp11.First;
              if ($temp11.Second.$wrapped) {
                $current = 45;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 50;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 45:
              child = updatedChildren.$index(index);
              childKey = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.getInferredNodeKey($g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(child), index);
              addCreate = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              handledDiff = keysHandled.$index(childKey);
              if (handledDiff != null) {
                $current = 46;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 47;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 46:
              childInPlaceDiffs.Add(handledDiff);
              addCreate = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 47;
              $continue($resolve, $reject);
              return;

            case 47:
              if (addCreate.$wrapped) {
                $current = 48;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 49;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 48:
              childInsertionDiffs.Add(($temp13 = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_CREATE_NODE, index, $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()), $temp13.ReplacementNode = child, $temp13));
              $current = 49;
              $continue($resolve, $reject);
              return;

            case 49:
              $current = 44;
              $continue($resolve, $reject);
              return;

            case 50:
              $current = 51;
              $continue($resolve, $reject);
              return;

            case 51:
              childrenDiffs = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Concat($g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff).Concat(childInPlaceDiffs, childRemovalDiffs), childInsertionDiffs);
              $resolve(($temp14 = $g.pkg.github.com.Serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.DIFF_THUNK, parentIndex, childrenDiffs.$slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null), attributeDiffs.$slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null)), $temp14.ReplacementNode = updatedNode, $temp14));
              return;

            case 52:
              if (!$g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean.$equals(updated.IsElement(), existing.IsElement()).$wrapped) {
                $current = 53;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 54;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 53:
              needsReplacement = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 54:
              if (existing.IsElement().$wrapped && !$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals(updated.TagName().ToLowerCase(), existing.TagName().ToLowerCase()).$wrapped) {
                $current = 55;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 56;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 55:
              needsReplacement = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 56:
              if (!existing.IsElement().$wrapped) {
                $current = 57;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 6;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 57:
              needsReplacement = $t.fastbox(!$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($t.syncnullcompare(updated.TextData(), function () {
                return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              }), $t.syncnullcompare(existing.TextData(), function () {
                return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              })).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 6;
              $continue($resolve, $reject);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_REPLACE_NODE = $t.fastbox('replace-node', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        resolve();
      });
    }, '7a79982b', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_REMOVE_NODE = $t.fastbox('remove-node', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        resolve();
      });
    }, 'b70ea4c2', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_CREATE_NODE = $t.fastbox('create-node', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        resolve();
      });
    }, '163ad935', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_SAME = $t.fastbox('same-node', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        resolve();
      });
    }, 'b559b731', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_THUNK = $t.fastbox('thunk', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        resolve();
      });
    }, '82d03dba', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.nodeCounter = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        resolve();
      });
    }, 'f2c7fa0f', []);
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.eventmanager', function () {
    var $static = this;
    this.$class('8c33a845', 'EventManager', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (element) {
        var instance = new $static();
        instance.element = element;
        instance.registered = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Set($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty();
        instance.functionRefCounter = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
        instance.handlers = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.functionType($t.void)).Empty();
        instance.tree = $g.pkg.github.com.Serulian.virtualdom.HEAD.eventmanager.eventTree.new();
        return instance;
      };
      $static.ForElement = function (element) {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.eventmanager.EventManager.new(element);
      };
      $instance.NodeRemoved = function (domNode) {
        var $this = this;
        var path;
        var split;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (!$t.fastbox(domNode, $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.NodeWrapper).IsElement().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return;

            case 2:
              path = $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
              split = path.Split($t.fastbox('.', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
              $this.tree.removeBranch(split);
              return;

            default:
              return;
          }
        }
      };
      $instance.NodeCreated = $t.markpromising(function (virtualNode, domNode) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var eventHandlers;
        var eventName;
        var handlerRef;
        var insertedCallback;
        var path;
        var split;
        var treeEntry;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                insertedCallback = virtualNode.DOMNodeInserted;
                if (insertedCallback != null) {
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 1:
                $promise.maybe($this.invokeHandler(insertedCallback, domNode)).then(function ($result0) {
                  $result = $result0;
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 2:
                $current = 3;
                $continue($resolve, $reject);
                return;

              case 3:
                eventHandlers = virtualNode.EventHandlers;
                if (eventHandlers != null) {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 13;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 4:
                if (eventHandlers.IsEmpty().$wrapped) {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 5:
                $resolve();
                return;

              case 6:
                path = $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
                split = path.Split($t.fastbox('.', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                treeEntry = $this.tree.getOrAddBranch(split);
                treeEntry.clearHandlers();
                $current = 7;
                $continue($resolve, $reject);
                return;

              case 7:
                $temp1 = eventHandlers.Keys().Stream();
                $current = 8;
                $continue($resolve, $reject);
                return;

              case 8:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 9;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 9:
                eventName = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 10;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 12;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 10:
                $promise.maybe($this.register(eventName)).then(function ($result0) {
                  $result = $result0;
                  $current = 11;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 11:
                handlerRef = eventHandlers.$index(eventName);
                treeEntry.addHandler(eventName, $t.assertnotnull(handlerRef));
                $current = 8;
                $continue($resolve, $reject);
                return;

              case 12:
                $current = 13;
                $continue($resolve, $reject);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.NodeUpdated = $t.markpromising(function (virtualNode, domNode) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var eventHandlers;
        var eventName;
        var handlerRef;
        var path;
        var split;
        var treeEntry;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                path = $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
                split = path.Split($t.fastbox('.', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                treeEntry = $this.tree.getOrAddBranch(split);
                treeEntry.clearHandlers();
                eventHandlers = virtualNode.EventHandlers;
                if (eventHandlers != null) {
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 8;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 1:
                $current = 2;
                $continue($resolve, $reject);
                return;

              case 2:
                $temp1 = eventHandlers.Keys().Stream();
                $current = 3;
                $continue($resolve, $reject);
                return;

              case 3:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 4:
                eventName = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 5:
                $promise.maybe($this.register(eventName)).then(function ($result0) {
                  $result = $result0;
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 6:
                handlerRef = eventHandlers.$index(eventName);
                treeEntry.addHandler(eventName, $t.assertnotnull(handlerRef));
                $current = 3;
                $continue($resolve, $reject);
                return;

              case 7:
                $current = 8;
                $continue($resolve, $reject);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.RegisterFunction = function (func) {
        var $this = this;
        var ref;
        ref = $this.functionRefCounter.String();
        $this.handlers.$setindex(ref, func);
        $this.functionRefCounter = $t.fastbox($this.functionRefCounter.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
        return $t.box(ref, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference);
      };
      $instance.handleEvent = $t.markpromising(function (evt) {
        var $this = this;
        var $result;
        var handler;
        var path;
        var split;
        var target;
        var treeEntry;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                target = evt.target;
                if (target == null) {
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 1:
                $resolve();
                return;

              case 2:
                path = $g.pkg.github.com.Serulian.virtualdom.HEAD.internal.getDOMPath($t.assertnotnull(target));
                split = path.Split($t.fastbox('.', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                treeEntry = $this.tree.getBranch(split);
                if (treeEntry == null) {
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 3:
                $resolve();
                return;

              case 4:
                handler = $t.assertnotnull(treeEntry).lookupHandler($t.fastbox(evt['type'], $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                if (handler != null) {
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 5:
                $promise.maybe($this.invokeHandler(handler, evt)).then(function ($result0) {
                  $result = $result0;
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 6:
                $current = 7;
                $continue($resolve, $reject);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.invokeHandler = function (handler, param) {
        var $this = this;
        var handlerFunc;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              handlerFunc = $this.handlers.$index($t.box(handler, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
              if (handlerFunc != null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              handlerFunc(param);
              $current = 2;
              continue syncloop;

            default:
              return;
          }
        }
      };
      $instance.register = $t.markpromising(function (eventName) {
        var $this = this;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                if ($this.registered.Add(eventName).$wrapped) {
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 1:
                $this.element.addEventListener(eventName.$wrapped, $t.markpromising(function (evt) {
                  var $result;
                  var $current = 0;
                  var $continue = function ($resolve, $reject) {
                    while (true) {
                      switch ($current) {
                        case 0:
                          $promise.maybe($this.handleEvent(evt)).then(function ($result0) {
                            $result = $result0;
                            $current = 1;
                            $continue($resolve, $reject);
                            return;
                          }).catch(function (err) {
                            $reject(err);
                            return;
                          });
                          return;

                        default:
                          $resolve();
                          return;
                      }
                    }
                  };
                  return $promise.new($continue);
                }));
                $current = 2;
                $continue($resolve, $reject);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "ForElement|1|9ed61ffb<8c33a845>": true,
          "NodeRemoved|2|9ed61ffb<void>": true,
          "NodeCreated|2|9ed61ffb<void>": true,
          "NodeUpdated|2|9ed61ffb<void>": true,
          "RegisterFunction|2|9ed61ffb<fd74b88d>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('f905e6be', 'eventTree', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.children = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.virtualdom.HEAD.eventmanager.eventTree).Empty();
        instance.handlers = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference).Empty();
        return instance;
      };
      $instance.removeBranch = function (parts) {
        var $this = this;
        var child;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (parts.Length().$wrapped == 1) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              $this.children.RemoveKey(parts.$index($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer)));
              return;

            case 2:
              child = $this.children.$index(parts.$index($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer)));
              if (child == null) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              return;

            case 4:
              $t.assertnotnull(child).removeBranch(parts.$slice($t.fastbox(1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null));
              return;

            default:
              return;
          }
        }
      };
      $instance.getOrAddBranch = function (parts) {
        var $this = this;
        var child;
        var index;
        var newBranch;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (parts.Length().$wrapped == 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $this;

            case 2:
              child = $this.children.$index(parts.$index($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer)));
              if (child == null) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              newBranch = $g.pkg.github.com.Serulian.virtualdom.HEAD.eventmanager.eventTree.new();
              index = parts.$index($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer));
              $this.children.$setindex(index, newBranch);
              return newBranch.getOrAddBranch(parts.$slice($t.fastbox(1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null));

            case 4:
              return $t.assertnotnull(child).getOrAddBranch(parts.$slice($t.fastbox(1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null));

            default:
              return;
          }
        }
      };
      $instance.getBranch = function (parts) {
        var $this = this;
        var child;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (parts.Length().$wrapped == 0) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $this;

            case 2:
              child = $this.children.$index(parts.$index($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer)));
              if (child == null) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              return null;

            case 4:
              return $t.assertnotnull(child).getBranch(parts.$slice($t.fastbox(1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null));

            default:
              return;
          }
        }
      };
      $instance.clearHandlers = function () {
        var $this = this;
        $this.handlers = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference).Empty();
        return;
      };
      $instance.addHandler = function (eventName, funcRef) {
        var $this = this;
        $this.handlers.$setindex(eventName, funcRef);
        return;
      };
      $instance.lookupHandler = function (eventName) {
        var $this = this;
        return $this.handlers.$index(eventName);
      };
      this.$typesig = function () {
        return {
        };
      };
    });

  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.internal', function () {
    var $static = this;
    $static.getDOMPath = function (node) {
      var existingPath;
      var $current = 0;
      syncloop: while (true) {
        switch ($current) {
          case 0:
            existingPath = node[$g.pkg.github.com.Serulian.virtualdom.HEAD.internal.elementInternalPath.$wrapped];
            if (existingPath == null) {
              $current = 1;
              continue syncloop;
            } else {
              $current = 2;
              continue syncloop;
            }
            break;

          case 1:
            return $t.fastbox('(root)', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

          case 2:
            return $t.fastbox($t.cast(existingPath, $global.String, false), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

          default:
            return;
        }
      }
    };
    $static.setDOMPath = function (node, elementPath) {
      node[$g.pkg.github.com.Serulian.virtualdom.HEAD.internal.elementInternalPath.$wrapped] = elementPath.$wrapped;
      return;
    };
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.elementInternalPath = $t.fastbox("__internal_dom_path", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        resolve();
      });
    }, 'fb157eae', []);
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.render', function () {
    var $static = this;
    $static.Render = $t.markpromising(function (renderable, context, node) {
      var $result;
      var diff;
      var rendered;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.RenderToVirtualNode(renderable, context)).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 1:
              rendered = $result;
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ComputeDiff(rendered, $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.NodeWrapper.For(node))).then(function ($result0) {
                $result = $result0;
                $current = 2;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 2:
              diff = $result;
              $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.diff.ApplyDiff(diff, node, context.EventManager())).then(function ($result0) {
                $result = $result0;
                $current = 3;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.renderable', function () {
    var $static = this;
    this.$class('c69c670b', 'EmptyContext', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (em) {
        var instance = new $static();
        instance.em = em;
        return instance;
      };
      $static.WithEventManager = function (em) {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.EmptyContext.new(em);
      };
      $instance.Get = function (T) {
        var $this = this;
        var $f = function (name) {
          return null;
        };
        return $f;
      };
      $instance.EventManager = $t.property(function () {
        var $this = this;
        return $this.em;
      });
      $instance.Renderer = $t.property(function () {
        var $this = this;
        return null;
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "WithEventManager|1|9ed61ffb<c69c670b>": true,
          "EventManager|3|8c33a845": true,
          "Renderer|3|df20448e": true,
        };
        computed[("Get|2|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('809df317', 'renderableVirtualNode', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (tagName, props, children) {
        var instance = new $static();
        instance.tagName = tagName;
        instance.props = props;
        instance.children = children;
        return instance;
      };
      $instance.RenderKey = $t.property(function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.props.$index($t.fastbox("Key", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)) != null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.cast($this.props.$index($t.fastbox("Key", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, false);

            case 2:
              return null;

            default:
              return;
          }
        }
      });
      $instance.Render = $t.markpromising(function (context) {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.renderUnderRoot($this, $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), context)).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 1:
                $resolve($result);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.renderUnderRoot = $t.markpromising(function (root, pathUnderRoot, context) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var $temp2;
        var $temp3;
        var $temp4;
        var $temp5;
        var $temp6;
        var attributes;
        var child;
        var childList;
        var children;
        var cn;
        var currentPathUnderRoot;
        var eventHandlers;
        var fn;
        var index;
        var key;
        var name;
        var nodeInsertedHandler;
        var propValue;
        var props;
        var renderer;
        var typedChild;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                attributes = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty();
                eventHandlers = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference).Empty();
                key = null;
                nodeInsertedHandler = null;
                props = $this.props;
                children = $this.children;
                if (!props.IsEmpty().$wrapped) {
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 26;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 1:
                if (props.$index($t.fastbox("Key", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)) != null) {
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 2:
                key = $t.cast(props.$index($t.fastbox("Key", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, false);
                $current = 3;
                $continue($resolve, $reject);
                return;

              case 3:
                $current = 4;
                $continue($resolve, $reject);
                return;

              case 4:
                $temp1 = props.Keys().Stream();
                $current = 5;
                $continue($resolve, $reject);
                return;

              case 5:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 6:
                name = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 25;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 7:
                if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals(name, $t.fastbox("ondomnodeinserted", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped) {
                  $current = 8;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 10;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 8:
                fn = $t.cast(props.$index(name), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.functionType($t.void), false);
                nodeInsertedHandler = context.EventManager().RegisterFunction(fn);
                $current = 9;
                $continue($resolve, $reject);
                return;

              case 9:
                $current = 5;
                $continue($resolve, $reject);
                return;

              case 10:
                if (name.HasPrefix($t.fastbox("on", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped) {
                  $current = 11;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 13;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 11:
                fn = $t.cast(props.$index(name), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.functionType($t.void), false);
                eventHandlers.$setindex(name.$slice($t.fastbox(2, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null), context.EventManager().RegisterFunction(fn));
                $current = 12;
                $continue($resolve, $reject);
                return;

              case 12:
                $current = 9;
                $continue($resolve, $reject);
                return;

              case 13:
                if (!$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals(name, $t.fastbox("Key", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped) {
                  $current = 14;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 17;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 14:
                if ($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals(name, $t.fastbox("className", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped) {
                  $current = 15;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 18;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 15:
                attributes.$setindex($t.fastbox('class', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.cast(props.$index(name), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, false));
                $current = 16;
                $continue($resolve, $reject);
                return;

              case 16:
                $current = 17;
                $continue($resolve, $reject);
                return;

              case 17:
                $current = 12;
                $continue($resolve, $reject);
                return;

              case 18:
                propValue = props.$index(name);
                if ($t.istype(propValue, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)) {
                  $current = 19;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 21;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 19:
                attributes.$setindex(name, propValue);
                $current = 20;
                $continue($resolve, $reject);
                return;

              case 20:
                $current = 16;
                $continue($resolve, $reject);
                return;

              case 21:
                if ($t.istype(propValue, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)) {
                  $current = 22;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 23;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 22:
                attributes.$setindex(name, name);
                $current = 20;
                $continue($resolve, $reject);
                return;

              case 23:
                if (true) {
                  $current = 24;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 20;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 24:
                $reject($g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError.WithMessage($t.fastbox('Unsupported attribute type', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)));
                return;

              case 25:
                $current = 26;
                $continue($resolve, $reject);
                return;

              case 26:
                childList = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Empty();
                index = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
                $current = 27;
                $continue($resolve, $reject);
                return;

              case 27:
                $temp3 = children;
                $current = 28;
                $continue($resolve, $reject);
                return;

              case 28:
                $promise.maybe($temp3.Next()).then(function ($result0) {
                  $temp2 = $result0;
                  $result = $temp2;
                  $current = 29;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 29:
                child = $temp2.First;
                if ($temp2.Second.$wrapped) {
                  $current = 30;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 51;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 30:
                index = $t.fastbox(index.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                if (child == null) {
                  $current = 31;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 32;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 31:
                $current = 28;
                $continue($resolve, $reject);
                return;

              case 32:
                typedChild = child;
                if ($t.istype(typedChild, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)) {
                  $current = 33;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 35;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 33:
                childList.Add(($temp4 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp4.Text = typedChild, $temp4));
                $current = 34;
                $continue($resolve, $reject);
                return;

              case 34:
                $current = 28;
                $continue($resolve, $reject);
                return;

              case 35:
                if ($t.istype(typedChild, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode)) {
                  $current = 36;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 37;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 36:
                childList.Add(typedChild);
                $current = 34;
                $continue($resolve, $reject);
                return;

              case 37:
                if ($t.istype(typedChild, $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode)) {
                  $current = 38;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 40;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 38:
                currentPathUnderRoot = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("[", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("]", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([pathUnderRoot, index]));
                $promise.maybe(typedChild.renderUnderRoot(root, currentPathUnderRoot, context)).then(function ($result0) {
                  $result = $result0;
                  $current = 39;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 39:
                cn = $result;
                childList.Add(cn);
                $current = 34;
                $continue($resolve, $reject);
                return;

              case 40:
                if ($t.istype(typedChild, $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.Renderable)) {
                  $current = 41;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 47;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 41:
                renderer = context.Renderer();
                if (renderer != null) {
                  $current = 42;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 45;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 42:
                currentPathUnderRoot = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("[", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("]", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([pathUnderRoot, index]));
                $promise.maybe(renderer.Render(typedChild, root, currentPathUnderRoot, context)).then(function ($result0) {
                  $result = childList.Add($result0);
                  $current = 43;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 43:
                $current = 44;
                $continue($resolve, $reject);
                return;

              case 44:
                $current = 34;
                $continue($resolve, $reject);
                return;

              case 45:
                $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.RenderToVirtualNode(typedChild, context)).then(function ($result0) {
                  $result = childList.Add($result0);
                  $current = 46;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 46:
                $current = 44;
                $continue($resolve, $reject);
                return;

              case 47:
                if ($t.istype(typedChild, $g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable)) {
                  $current = 48;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 49;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 48:
                childList.Add(($temp5 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp5.Text = typedChild.String(), $temp5));
                $current = 34;
                $continue($resolve, $reject);
                return;

              case 49:
                if (true) {
                  $current = 50;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 34;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 50:
                $reject($g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError.WithMessage($t.fastbox('Unsupported instance under VirtualNode. Did you forget to add a Render() method to a class?', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)));
                return;

              case 51:
                $resolve(($temp6 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp6.EventHandlers = eventHandlers.Mapping(), $temp6.Attributes = attributes.Mapping(), $temp6.Children = childList.$slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null), $temp6.DOMNodeInserted = nodeInsertedHandler, $temp6.Key = key, $temp6.TagName = $this.tagName, $temp6));
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "RenderKey|3|bf97cefa": true,
          "Render|2|9ed61ffb<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('7c1c1b7f', 'RenderKeyed', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "RenderKey|3|bf97cefa": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('5a6e0013', 'Context', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Renderer|3|df20448e": true,
          "EventManager|3|8c33a845": true,
        };
        computed[("Get|2|9ed61ffb<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('df20448e', 'Renderer', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|9ed61ffb<e3adf311>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('bc58a04a', 'Renderable', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|9ed61ffb<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.RenderToVirtualNode = $t.markpromising(function (instance, context) {
      var $result;
      var $temp0;
      var $temp1;
      var $temp2;
      var current;
      var err;
      var index;
      var keyed;
      var rootParent;
      var typedValue;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              current = instance;
              rootParent = null;
              index = $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              $current = 1;
              $continue($resolve, $reject);
              return;

            case 1:
              if (true) {
                $current = 2;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 20;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 2:
              if (current == null) {
                $current = 3;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 4;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 3:
              $resolve(($temp0 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Text = $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0));
              return;

            case 4:
              typedValue = current;
              if ($t.istype(typedValue, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode)) {
                $current = 5;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 9;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 5:
              try {
                var $expr = $t.cast(instance, $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.RenderKeyed, false);
                keyed = $expr;
                err = null;
              } catch ($rejected) {
                err = $rejected;
                keyed = null;
              }
              $current = 6;
              $continue($resolve, $reject);
              return;

            case 6:
              if (keyed != null) {
                $current = 7;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 8;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 7:
              $resolve(($temp1 = typedValue.Clone(), $temp1.Key = keyed.RenderKey(), $temp1));
              return;

            case 8:
              $resolve(typedValue);
              return;

            case 9:
              if ($t.istype(typedValue, $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode)) {
                $current = 10;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 13;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 10:
              $promise.maybe(typedValue.renderUnderRoot($t.syncnullcompare(rootParent, function () {
                return typedValue;
              }), $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), context)).then(function ($result0) {
                current = $result0;
                $result = current;
                $current = 11;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 11:
              $current = 12;
              $continue($resolve, $reject);
              return;

            case 12:
              index = $t.fastbox(index.$wrapped + 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              $current = 1;
              $continue($resolve, $reject);
              return;

            case 13:
              if ($t.istype(typedValue, $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.Renderable)) {
                $current = 14;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 18;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 14:
              if (index.$wrapped == 0) {
                $current = 15;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 16;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 15:
              rootParent = typedValue;
              $current = 16;
              $continue($resolve, $reject);
              return;

            case 16:
              $promise.maybe(typedValue.Render(context)).then(function ($result0) {
                current = $result0;
                $result = current;
                $current = 17;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 17:
              $current = 12;
              $continue($resolve, $reject);
              return;

            case 18:
              if (true) {
                $current = 19;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 12;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 19:
              $reject($g.pkg.github.com.Serulian.corelib.branch.master.helpertypes.SimpleError.WithMessage($t.fastbox('Unsupported value under Render. Did you forget to add a Render method?', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)));
              return;

            case 20:
              $resolve(($temp2 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp2.Text = $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp2));
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.getChildPath = function (parentPath, childIndex, child) {
      var anyChild;
      var key;
      var renderKeyed;
      var $current = 0;
      syncloop: while (true) {
        switch ($current) {
          case 0:
            anyChild = child;
            try {
              var $expr = $t.cast(anyChild, $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.RenderKeyed, false);
              renderKeyed = $expr;
            } catch ($rejected) {
              renderKeyed = null;
            }
            $current = 1;
            continue syncloop;

          case 1:
            if (renderKeyed != null) {
              $current = 2;
              continue syncloop;
            } else {
              $current = 5;
              continue syncloop;
            }
            break;

          case 2:
            key = renderKeyed.RenderKey();
            if (key != null) {
              $current = 3;
              continue syncloop;
            } else {
              $current = 4;
              continue syncloop;
            }
            break;

          case 3:
            return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox(".", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([parentPath, key]));

          case 4:
            $current = 5;
            continue syncloop;

          case 5:
            return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("[", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("]", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([parentPath, childIndex]));

          default:
            return;
        }
      }
    };
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.style', function () {
    var $static = this;
    this.$struct('3d4a0d2a', 'stylesheetProps', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'Contents', 'Contents', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<3d4a0d2a>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<3d4a0d2a>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.Stylesheet = function (props, definition) {
      var $temp0;
      var $temp1;
      var cssContents;
      cssContents = $t.syncnullcompare(definition, function () {
        return $t.syncnullcompare(props.Contents, function () {
          return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        });
      });
      return ($temp1 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp1.Children = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).overArray([($temp0 = $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Text = cssContents, $temp0)]), $temp1.TagName = $t.fastbox('style', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp1.Attributes = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overObject(function () {
        var obj = {
        };
        obj["type"] = $t.fastbox("text/css", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        return obj;
      }()), $temp1);
    };
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.types', function () {
    var $static = this;
    this.$type('fd74b88d', 'FunctionReference', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.String;
      };
      this.$typesig = function () {
        return {
        };
      };
    });

    this.$struct('e3adf311', 'VirtualNode', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'TagName', 'TagName', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, true);
      $t.defineStructField($static, 'Attributes', 'Attributes', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
      }, true);
      $t.defineStructField($static, 'Key', 'Key', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, true);
      $t.defineStructField($static, 'Text', 'Text', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, true);
      $t.defineStructField($static, 'Children', 'Children', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode);
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode);
      }, true);
      $t.defineStructField($static, 'EventHandlers', 'EventHandlers', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference);
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference);
      }, true);
      $t.defineStructField($static, 'DOMNodeInserted', 'DOMNodeInserted', function () {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.types.FunctionReference;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<e3adf311>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<e3adf311>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.vdom', function () {
    var $static = this;
    $static.A = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('a', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Span = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('span', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Div = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('div', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Img = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('img', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Select = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('select', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Option = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('option', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Style = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('style', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Button = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('button', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.TextArea = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('textarea', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.IFrame = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('iframe', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Pre = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('pre', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Nav = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('nav', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Ul = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('ul', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
    $static.Li = function (props, childStream) {
      return $g.pkg.github.com.Serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('li', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), props, childStream);
    };
  });
  $module('pkg.github.com.Serulian.virtualdom.HEAD.wrappers', function () {
    var $static = this;
    this.$class('938700b4', 'DOMError', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (message) {
        var instance = new $static();
        instance.message = message;
        return instance;
      };
      $static.WithMessage = function (message) {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.DOMError.new(message);
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $this.message;
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "WithMessage|1|9ed61ffb<938700b4>": true,
          "Message|3|bf97cefa": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('aa000335', 'DOMNode', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "IsElement|3|2d2c9633": true,
          "TagName|3|bf97cefa": true,
          "Key|3|bf97cefa": true,
          "TextData|3|bf97cefa": true,
          "AttributeNames|3|b92e08f7<bf97cefa>": true,
          "ChildCount|3|6b1b3069": true,
          "GetChild|2|9ed61ffb<aa000335>": true,
          "GetAttribute|2|9ed61ffb<bf97cefa>": true,
          "Virtual|3|e3adf311": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('65acacbf', 'NodeWrapper', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Node;
      };
      $static.For = function (node) {
        return $t.fastbox(node, $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.NodeWrapper);
      };
      $instance.AttributeNames = $t.property($t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var attr;
        var attributes;
        var names;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                if (!$this.IsElement().$wrapped) {
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 1:
                $resolve($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty());
                return;

              case 2:
                attributes = $this.$wrapped.attributes;
                names = $g.pkg.github.com.Serulian.corelib.branch.master.collections.List($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty();
                $current = 3;
                $continue($resolve, $reject);
                return;

              case 3:
                $temp1 = $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($t.any).ForArray(attributes).Stream();
                $current = 4;
                $continue($resolve, $reject);
                return;

              case 4:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 5:
                attr = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 8;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 6:
                $t.dynamicaccess(attr, 'name', true).then(function ($result0) {
                  $result = names.Add($t.fastbox($t.cast($result0, $global.String, false), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 7:
                $current = 4;
                $continue($resolve, $reject);
                return;

              case 8:
                $resolve(names.$slice($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), null));
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      }));
      $instance.Key = $t.property(function () {
        var $this = this;
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.keyAttachment.$index($this.$wrapped);
      });
      $instance.IsElement = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.nodeType == 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      });
      $instance.TagName = $t.property(function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (!$this.IsElement().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

            case 2:
              return $t.fastbox($this.$wrapped.tagName, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).ToLowerCase();

            default:
              return;
          }
        }
      });
      $instance.TextData = $t.property(function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.IsElement().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return null;

            case 2:
              return $t.fastbox($this.$wrapped.wholeText, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

            default:
              return;
          }
        }
      });
      $instance.ChildCount = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.childNodes.length, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
      });
      $instance.Virtual = $t.property(function () {
        var $this = this;
        return null;
      });
      $instance.GetChild = function (index) {
        var $this = this;
        var child;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              child = $this.$wrapped.childNodes[index.$wrapped];
              if (child == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              throw $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Invalid child index', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 2:
              return $t.fastbox($t.assertnotnull(child), $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.NodeWrapper);

            default:
              return;
          }
        }
      };
      $instance.GetAttribute = function (name) {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (!$this.IsElement().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              throw $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Cannot retrieve attribute for non-element', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 2:
              return $t.fastbox($this.$wrapped.getAttribute(name.$wrapped), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "For|1|9ed61ffb<65acacbf>": true,
          "AttributeNames|3|b92e08f7<bf97cefa>": true,
          "Key|3|bf97cefa": true,
          "IsElement|3|2d2c9633": true,
          "TagName|3|bf97cefa": true,
          "TextData|3|bf97cefa": true,
          "ChildCount|3|6b1b3069": true,
          "Virtual|3|e3adf311": true,
          "GetChild|2|9ed61ffb<aa000335>": true,
          "GetAttribute|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('35c0a118', 'VirtualNodeWrapper', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode;
      };
      $static.For = function (node) {
        return $t.box(node, $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper);
      };
      $instance.Virtual = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode);
      });
      $instance.Key = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Key;
      });
      $instance.AttributeNames = $t.property(function () {
        var $this = this;
        var attrs;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              attrs = $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Attributes;
              if (attrs == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty();

            case 2:
              return attrs.Keys();

            default:
              return;
          }
        }
      });
      $instance.IsElement = $t.property(function () {
        var $this = this;
        return $t.fastbox(!($t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).TagName == null), $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
      });
      $instance.TagName = $t.property(function () {
        var $this = this;
        return $t.syncnullcompare($t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).TagName, function () {
          return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        });
      });
      $instance.ChildCount = $t.property(function () {
        var $this = this;
        var children;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              children = $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Children;
              if (children == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);

            case 2:
              return children.Length();

            default:
              return;
          }
        }
      });
      $instance.TextData = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Text;
      });
      $instance.GetChild = function (index) {
        var $this = this;
        var children;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (index.$wrapped >= $this.ChildCount().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              throw $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Invalid child index', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 2:
              children = $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Children;
              return $t.box($t.assertnotnull(children).$index(index), $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper);

            default:
              return;
          }
        }
      };
      $instance.GetAttribute = function (name) {
        var $this = this;
        var attributes;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (!$this.IsElement().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              throw $g.pkg.github.com.Serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Cannot retrieve attribute for non-element', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));

            case 2:
              attributes = $t.box($this, $g.pkg.github.com.Serulian.virtualdom.HEAD.types.VirtualNode).Attributes;
              if (attributes != null) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              return attributes.$index(name);

            case 4:
              return null;

            default:
              return;
          }
        }
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "For|1|9ed61ffb<35c0a118>": true,
          "Virtual|3|e3adf311": true,
          "Key|3|bf97cefa": true,
          "AttributeNames|3|b92e08f7<bf97cefa>": true,
          "IsElement|3|2d2c9633": true,
          "TagName|3|bf97cefa": true,
          "ChildCount|3|6b1b3069": true,
          "TextData|3|bf97cefa": true,
          "GetChild|2|9ed61ffb<aa000335>": true,
          "GetAttribute|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.keyAttachment = $g.pkg.github.com.Serulian.attachment.HEAD.attachment.Attachment($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Unique($t.fastbox('vdom-key', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
        resolve();
      });
    }, '495cff3c', ['1bd2fcc2']);
  });
  $module('playground', function () {
    var $static = this;
    this.$class('2daf4a09', 'playgroundBase', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (state) {
        var instance = new $static();
        instance.state = state;
        return instance;
      };
      $instance.StateUpdated = function (state) {
        var $this = this;
        $this.state = $t.cast(state, $g.playground.playgroundState, false);
        return;
      };
      $instance.runProject = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var $temp2;
        var $temp3;
        var response;
        var result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.buildResult = null, $temp0.currentView = $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0.consoleOutput = $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0.working = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp0.serverError = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp0))).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 1:
                $promise.maybe($g.pkg.github.com.Serulian.request.HEAD.request.Post($t.fastbox('/play/build', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $this.state.currentCode)).then(function ($result0) {
                  response = $result0;
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                }).catch(function ($rejected) {
                  response = null;
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                });
                return;

              case 2:
                if (response == null) {
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 6;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 3:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp1 = $this.state.Clone(), $temp1.working = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp1.serverError = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp1.buildResult = null, $temp1.currentView = $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp1))).then(function ($result0) {
                  $result = $result0;
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 4:
                $current = 5;
                $continue($resolve, $reject);
                return;

              case 6:
                if (response.StatusCode().$wrapped == 200) {
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 11;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 7:
                $promise.maybe($g.playground.BuildResult.Parse($g.pkg.github.com.Serulian.corelib.branch.master.serialization.JSON)(response.Text())).then(function ($result0) {
                  $result = $result0;
                  $current = 8;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 8:
                result = $result;
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp2 = $this.state.Clone(), $temp2.working = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp2.serverError = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp2.buildResult = result, $temp2.currentView = result.Status.$wrapped == 0 ? $t.fastbox('frame', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String) : $t.fastbox('output', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp2))).then(function ($result0) {
                  $result = $result0;
                  $current = 9;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 9:
                $current = 10;
                $continue($resolve, $reject);
                return;

              case 10:
                $current = 5;
                $continue($resolve, $reject);
                return;

              case 11:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp3 = $this.state.Clone(), $temp3.buildResult = null, $temp3.currentView = $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp3.working = $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp3.serverError = $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $temp3))).then(function ($result0) {
                  $result = $result0;
                  $current = 12;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 12:
                $current = 10;
                $continue($resolve, $reject);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.codeChanged = $t.markpromising(function (value) {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentCode = value, $temp0))).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.updateConsole = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var buffer;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                buffer = $t.syncnullcompare($this.consoleOutputBuffer, function () {
                  return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
                });
                $this.consoleOutputBuffer = null;
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.consoleOutput = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($this.state.consoleOutput, buffer), $t.fastbox('\n', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).Trim(), $temp0))).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 1:
                $this.timerHandle = null;
                if ($this.consoleOutputBuffer != null) {
                  $current = 2;
                  $continue($resolve, $reject);
                  return;
                } else {
                  $current = 4;
                  $continue($resolve, $reject);
                  return;
                }
                break;

              case 2:
                $promise.maybe($this.updateConsole()).then(function ($result0) {
                  $result = $result0;
                  $current = 3;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 3:
                $current = 4;
                $continue($resolve, $reject);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.registerConsoleUpdater = function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($this.timerHandle != null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return;

            case 2:
              $this.timerHandle = $global.setTimeout($t.dynamicaccess($this, 'updateConsole', false), 100);
              return;

            default:
              return;
          }
        }
      };
      $instance.emitCode = function (iframeNode) {
        var $this = this;
        var iframeDoc;
        var iframeElement;
        var loadScriptTag;
        var scriptTag;
        var sourceCode;
        var startCode;
        sourceCode = $t.syncnullcompare($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), function () {
          return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        });
        iframeElement = $t.cast(iframeNode, $global.HTMLIFrameElement, false);
        iframeDoc = iframeElement.contentWindow.document;
        scriptTag = iframeDoc.createElement('script');
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.appendChild(iframeDoc.createTextNode($t.unbox(sourceCode)));
        iframeDoc.body.appendChild(scriptTag);
        iframeElement['handler'] = function (message) {
          $this.consoleOutputBuffer = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($t.syncnullcompare($this.consoleOutputBuffer, function () {
            return $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
          }), message), $t.fastbox('\n', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
          $this.registerConsoleUpdater();
          return;
        };
        startCode = $t.fastbox("\n\t\t\tvar oldLog = window.console.log;\n\t\t\twindow.console.log = function(msg) {\n\t\t\t\toldLog.apply(this, arguments);\n\t\t\t\twindow.frameElement.handler(msg);\n\t\t\t};\n\n\t\t\twindow.Serulian.then(function(global) {\n\t\t\t\tglobal.playground.Run();\n\t\t\t});\n\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        loadScriptTag = iframeDoc.createElement('script');
        loadScriptTag.setAttribute('type', 'text/javascript');
        loadScriptTag.appendChild(iframeDoc.createTextNode($t.unbox(startCode)));
        iframeDoc.body.appendChild(loadScriptTag);
        return;
      };
      $instance.Render = function (context) {
        var $this = this;
        return null;
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "StateUpdated|2|9ed61ffb<void>": true,
          "Render|2|9ed61ffb<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('2a00743d', 'App', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (state) {
        var instance = new $static();
        instance.playgroundBase = $g.playground.playgroundBase.new(state);
        return instance;
      };
      $static.Declare = function () {
        return $g.playground.App.new($g.playground.playgroundState.new($t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)));
      };
      $instance.Render = function (context) {
        var $this = this;
        var initialCode;
        initialCode = $t.fastbox("from \"github.com/Serulian/debuglib:master\" import Log\n\nfunction<any> Run() {\n\t// Note: open the browser console to see Log outputs.\n\tLog('hello world!')\n\treturn true\n}", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
        return $g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
          id: $t.fastbox("rootElement", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
        }), function () {
          var $current = 0;
          var $continue = function ($yield, $yieldin, $reject, $done) {
            while (true) {
              switch ($current) {
                case 0:
                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Nav($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                    className: $t.fastbox("navbar navbar-default", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                    style: $t.fastbox("margin-bottom: 0px", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                  }), function () {
                    var $current = 0;
                    var $continue = function ($yield, $yieldin, $reject, $done) {
                      while (true) {
                        switch ($current) {
                          case 0:
                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.A($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("navbar-brand", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                              href: $t.fastbox("#", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                            }), function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($t.fastbox("Serulian Playground", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                      $current = 1;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            }()));
                            $current = 1;
                            return;

                          case 1:
                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("navbar-form navbar-left", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                            }), function () {
                              var $result;
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.DynamicAttributes($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Button($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("btn btn-primary", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                        onclick: $t.dynamicaccess($this, 'runProject', false),
                                      }), function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($t.fastbox("\n\t\t\t\t\t\tRun\n\t\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                                $current = 1;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      }()), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Map($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean).forArrays([$t.fastbox('disabled', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)], [$this.state.currentCode.IsEmpty()]))).then(function ($result0) {
                                        $result = $result0;
                                        $current = 1;
                                        $continue($yield, $yieldin, $reject, $done);
                                        return;
                                      }).catch(function (err) {
                                        throw err;
                                      });
                                      return;

                                    case 1:
                                      $yield($result);
                                      $current = 2;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, true);
                            }()), $t.fastbox(!$this.state.working.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                            $current = 2;
                            return;

                          case 2:
                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("navbar-form navbar-left", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                            }), function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("spinner", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                      }), $generator.directempty()));
                                      $current = 1;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            }()), $this.state.working));
                            $current = 3;
                            return;

                          case 3:
                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("navbar-form navbar-left", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                            }), function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($t.fastbox("\n\t\t\t\t\tA server error occurred. Please try again shortly.\n\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                      $current = 1;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            }()), $this.state.serverError));
                            $current = 4;
                            return;

                          default:
                            $done();
                            return;
                        }
                      }
                    };
                    return $generator.new($continue, false);
                  }()));
                  $current = 1;
                  return;

                case 1:
                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                    className: $t.fastbox("container-fluid editor-and-viewer", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                  }), function () {
                    var $current = 0;
                    var $continue = function ($yield, $yieldin, $reject, $done) {
                      while (true) {
                        switch ($current) {
                          case 0:
                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("row", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                            }), function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("col-md-6 col-sm-12", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                      }), function () {
                                        var $temp0;
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.codeeditor.CodeEditor.Declare(($temp0 = $g.codeeditor.codeEditorProps.new($this.state.working), $temp0.OnChanged = $t.dynamicaccess($this, 'codeChanged', false), $temp0), initialCode));
                                                $current = 1;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      }()));
                                      $current = 1;
                                      return;

                                    case 1:
                                      $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("col-md-6 col-sm-12", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                      }), function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                                  style: $t.fastbox("text-align: center; margin-top: 20px;", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                                }), function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Span($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("glyphicon glyphicon-arrow-left", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                                          }), $generator.directempty()));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $yield($t.fastbox(" Enter some code and hit \"Run\"\n\t\t\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                                          $current = 2;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                }()), $t.fastbox($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false) == null, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)), $t.fastbox(!$this.state.working.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                                  style: $t.fastbox("text-align: center; margin-top: 20px;", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                                }), function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($t.fastbox("\n\t\t\t\t\t\t\tBuilding...\n\t\t\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                                          $current = 1;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                }()), $this.state.working));
                                                $current = 2;
                                                return;

                                              case 2:
                                                $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.IFrame($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                                  frameborder: $t.fastbox("0", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                                  ondomnodeinserted: $t.dynamicaccess($this, 'emitCode', false),
                                                  sandbox: $t.fastbox("allow-forms allow-popups allow-scripts allow-same-origin allow-modals", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                                }), $generator.directempty()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), 'IsEmpty', false), function () {
                                                  return $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                                                }).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                                $current = 3;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      }()));
                                      $current = 2;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            }()));
                            $current = 1;
                            return;

                          case 1:
                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("row", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                            }), function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("col-md-12", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                      }), function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("build-result", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                                }), function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($t.dynamicaccess($this.state.buildResult, 'Output', false));
                                                          $current = 1;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                }()));
                                                $current = 1;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      }()));
                                      $current = 1;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            }()), $t.fastbox($this.state.buildResult != null, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)), $t.fastbox(!$this.state.working.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                            $current = 2;
                            return;

                          default:
                            $done();
                            return;
                        }
                      }
                    };
                    return $generator.new($continue, false);
                  }()));
                  $current = 2;
                  return;

                default:
                  $done();
                  return;
              }
            }
          };
          return $generator.new($continue, false);
        }());
      };
      Object.defineProperty($instance, 'state', {
        get: function () {
          return this.playgroundBase.state;
        },
        set: function (val) {
          this.playgroundBase.state = val;
        },
      });
      Object.defineProperty($instance, 'timerHandle', {
        get: function () {
          return this.playgroundBase.timerHandle;
        },
        set: function (val) {
          this.playgroundBase.timerHandle = val;
        },
      });
      Object.defineProperty($instance, 'consoleOutputBuffer', {
        get: function () {
          return this.playgroundBase.consoleOutputBuffer;
        },
        set: function (val) {
          this.playgroundBase.consoleOutputBuffer = val;
        },
      });
      Object.defineProperty($instance, 'StateUpdated', {
        get: function () {
          return this.playgroundBase.StateUpdated;
        },
      });
      Object.defineProperty($instance, 'runProject', {
        get: function () {
          return this.playgroundBase.runProject;
        },
      });
      Object.defineProperty($instance, 'codeChanged', {
        get: function () {
          return this.playgroundBase.codeChanged;
        },
      });
      Object.defineProperty($instance, 'updateConsole', {
        get: function () {
          return this.playgroundBase.updateConsole;
        },
      });
      Object.defineProperty($instance, 'registerConsoleUpdater', {
        get: function () {
          return this.playgroundBase.registerConsoleUpdater;
        },
      });
      Object.defineProperty($instance, 'emitCode', {
        get: function () {
          return this.playgroundBase.emitCode;
        },
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Declare|1|9ed61ffb<2a00743d>": true,
          "Render|2|9ed61ffb<any>": true,
          "StateUpdated|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('4c3664b1', 'PlaygroundEditor', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (state) {
        var instance = new $static();
        instance.playgroundBase = $g.playground.playgroundBase.new(state);
        return instance;
      };
      $static.Declare = function (attributes, code) {
        return $g.playground.PlaygroundEditor.new($g.playground.playgroundState.new($t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), code, code, $t.fastbox(false, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean), $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)));
      };
      $instance.showEditTab = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentView = $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0))).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.showOutputTab = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentView = $t.fastbox('output', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0))).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.showFrameTab = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentView = $t.fastbox('frame', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0))).then(function ($result0) {
                  $result = $result0;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.Render = function (context) {
        var $this = this;
        var height;
        var heightPx;
        var lineCount;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              height = $t.fastbox('auto', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              if (!$this.state.initialCode.IsEmpty().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 1:
              lineCount = $this.state.initialCode.Split($t.fastbox('\n', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).Length();
              heightPx = $t.fastbox((lineCount.$wrapped * 16) + 50, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
              if (heightPx.$wrapped > 1000) {
                $current = 2;
                continue syncloop;
              } else {
                $current = 3;
                continue syncloop;
              }
              break;

            case 2:
              heightPx = $t.fastbox(1000, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer);
              $current = 3;
              continue syncloop;

            case 3:
              height = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.formatTemplateString($g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).overArray([$t.fastbox("", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $t.fastbox("px", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)]), $g.pkg.github.com.Serulian.corelib.branch.master.collections.Slice($g.pkg.github.com.Serulian.corelib.branch.master.interfaces.Stringable).overArray([heightPx]));
              $current = 4;
              continue syncloop;

            case 4:
              return $g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                className: $t.fastbox("playgroundEditor", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                style: $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$plus($t.fastbox('height: ', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), height),
              }), function () {
                var $result;
                var $current = 0;
                var $continue = function ($yield, $yieldin, $reject, $done) {
                  while (true) {
                    switch ($current) {
                      case 0:
                        $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("pane", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                        }), function () {
                          var $temp0;
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $yield($g.codeeditor.CodeEditor.Declare(($temp0 = $g.codeeditor.codeEditorProps.new($this.state.working), $temp0.Theme = $t.fastbox("chrome", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0.Mode = $t.fastbox("text", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String), $temp0.OnChanged = $t.dynamicaccess($this, 'codeChanged', false), $temp0), $this.state.currentCode.Trim()));
                                  $current = 1;
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, false);
                        }()), $t.fastbox(!$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($this.state.currentView, $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean))).then(function ($result0) {
                          $result = $result0;
                          $current = 1;
                          $continue($yield, $yieldin, $reject, $done);
                          return;
                        }).catch(function (err) {
                          throw err;
                        });
                        return;

                      case 1:
                        $yield($result);
                        $current = 2;
                        return;

                      case 2:
                        $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("pane", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                        }), function () {
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("build-result", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                  }), function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($t.dynamicaccess($this.state.buildResult, 'Output', false));
                                            $current = 1;
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  }()), $t.fastbox($this.state.buildResult != null, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                  $current = 1;
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, false);
                        }()), $t.fastbox(!$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($this.state.currentView, $t.fastbox('output', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean))).then(function ($result0) {
                          $result = $result0;
                          $current = 3;
                          $continue($yield, $yieldin, $reject, $done);
                          return;
                        }).catch(function (err) {
                          throw err;
                        });
                        return;

                      case 3:
                        $yield($result);
                        $current = 4;
                        return;

                      case 4:
                        $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("pane", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                        }), function () {
                          var $result;
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $promise.maybe($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("console-output", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                  }), function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($this.state.consoleOutput);
                                            $current = 1;
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  }()), $this.state.consoleOutput.IsEmpty())).then(function ($result0) {
                                    $result = $result0;
                                    $current = 1;
                                    $continue($yield, $yieldin, $reject, $done);
                                    return;
                                  }).catch(function (err) {
                                    throw err;
                                  });
                                  return;

                                case 1:
                                  $yield($result);
                                  $current = 2;
                                  return;

                                case 2:
                                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.IFrame($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    frameborder: $t.fastbox("0", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                    ondomnodeinserted: $t.dynamicaccess($this, 'emitCode', false),
                                    sandbox: $t.fastbox("allow-forms allow-popups allow-scripts allow-same-origin allow-modals", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                  }), $generator.directempty()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), 'IsEmpty', false), function () {
                                    return $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                                  }).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                  $current = 3;
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, true);
                        }()), $t.fastbox(!$g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($this.state.currentView, $t.fastbox('frame', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean))).then(function ($result0) {
                          $result = $result0;
                          $current = 5;
                          $continue($yield, $yieldin, $reject, $done);
                          return;
                        }).catch(function (err) {
                          throw err;
                        });
                        return;

                      case 5:
                        $yield($result);
                        $current = 6;
                        return;

                      case 6:
                        $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("toolbar", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                        }), function () {
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Ul($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("tabs", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                  }), function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Li($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                              className: $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($this.state.currentView, $t.fastbox('edit', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped ? $t.fastbox('active', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String) : $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                              onclick: $t.dynamicaccess($this, 'showEditTab', false),
                                            }), function () {
                                              var $current = 0;
                                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                                while (true) {
                                                  switch ($current) {
                                                    case 0:
                                                      $yield($t.fastbox("\n\t\t\t\t\t\tCode\n\t\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                                      $current = 1;
                                                      return;

                                                    default:
                                                      $done();
                                                      return;
                                                  }
                                                }
                                              };
                                              return $generator.new($continue, false);
                                            }()));
                                            $current = 1;
                                            return;

                                          case 1:
                                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Li($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                              className: $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($this.state.currentView, $t.fastbox('output', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped ? $t.fastbox('active', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String) : $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                              onclick: $t.dynamicaccess($this, 'showOutputTab', false),
                                            }), function () {
                                              var $current = 0;
                                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                                while (true) {
                                                  switch ($current) {
                                                    case 0:
                                                      $yield($t.fastbox("\n\t\t\t\t\t\tOutput\n\t\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                                      $current = 1;
                                                      return;

                                                    default:
                                                      $done();
                                                      return;
                                                  }
                                                }
                                              };
                                              return $generator.new($continue, false);
                                            }()), $t.fastbox($this.state.buildResult != null, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                            $current = 2;
                                            return;

                                          case 2:
                                            $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Li($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                              className: $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String.$equals($this.state.currentView, $t.fastbox('frame', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String)).$wrapped ? $t.fastbox('active', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String) : $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                              onclick: $t.dynamicaccess($this, 'showFrameTab', false),
                                            }), function () {
                                              var $current = 0;
                                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                                while (true) {
                                                  switch ($current) {
                                                    case 0:
                                                      $yield($t.fastbox("\n\t\t\t\t\t\tCompiled\n\t\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                                      $current = 1;
                                                      return;

                                                    default:
                                                      $done();
                                                      return;
                                                  }
                                                }
                                              };
                                              return $generator.new($continue, false);
                                            }()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), 'IsEmpty', false), function () {
                                              return $t.fastbox(true, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean);
                                            }).$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                            $current = 3;
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  }()));
                                  $current = 1;
                                  return;

                                case 1:
                                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Button($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("btn btn-primary", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                    onclick: $t.dynamicaccess($this, 'runProject', false),
                                  }), function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($t.fastbox("\n\t\t\t\t\tRun\n\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                            $current = 1;
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  }()), $t.fastbox(!$this.state.working.$wrapped, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean)));
                                  $current = 2;
                                  return;

                                case 2:
                                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("spinner", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                  }), $generator.directempty()), $this.state.working));
                                  $current = 3;
                                  return;

                                case 3:
                                  $yield($g.pkg.github.com.Serulian.virtualdom.HEAD.decorators.If($g.pkg.github.com.Serulian.virtualdom.HEAD.vdom.Div($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("server-error", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String),
                                  }), function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($t.fastbox("\n\t\t\t\t\tA server error occurred. Please try again shortly.\n\t\t\t\t", $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String));
                                            $current = 1;
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  }()), $this.state.serverError));
                                  $current = 4;
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, false);
                        }()));
                        $current = 7;
                        return;

                      default:
                        $done();
                        return;
                    }
                  }
                };
                return $generator.new($continue, true);
              }());

            default:
              return;
          }
        }
      };
      Object.defineProperty($instance, 'state', {
        get: function () {
          return this.playgroundBase.state;
        },
        set: function (val) {
          this.playgroundBase.state = val;
        },
      });
      Object.defineProperty($instance, 'timerHandle', {
        get: function () {
          return this.playgroundBase.timerHandle;
        },
        set: function (val) {
          this.playgroundBase.timerHandle = val;
        },
      });
      Object.defineProperty($instance, 'consoleOutputBuffer', {
        get: function () {
          return this.playgroundBase.consoleOutputBuffer;
        },
        set: function (val) {
          this.playgroundBase.consoleOutputBuffer = val;
        },
      });
      Object.defineProperty($instance, 'StateUpdated', {
        get: function () {
          return this.playgroundBase.StateUpdated;
        },
      });
      Object.defineProperty($instance, 'runProject', {
        get: function () {
          return this.playgroundBase.runProject;
        },
      });
      Object.defineProperty($instance, 'codeChanged', {
        get: function () {
          return this.playgroundBase.codeChanged;
        },
      });
      Object.defineProperty($instance, 'updateConsole', {
        get: function () {
          return this.playgroundBase.updateConsole;
        },
      });
      Object.defineProperty($instance, 'registerConsoleUpdater', {
        get: function () {
          return this.playgroundBase.registerConsoleUpdater;
        },
      });
      Object.defineProperty($instance, 'emitCode', {
        get: function () {
          return this.playgroundBase.emitCode;
        },
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Declare|1|9ed61ffb<4c3664b1>": true,
          "Render|2|9ed61ffb<any>": true,
          "StateUpdated|2|9ed61ffb<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('042a8496', 'BuildResult', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (Status, Output, GeneratedSourceFile, GeneratedSourceMap) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          Status: Status,
          Output: Output,
          GeneratedSourceFile: GeneratedSourceFile,
          GeneratedSourceMap: GeneratedSourceMap,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'Status', 'Status', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer;
      }, false);
      $t.defineStructField($static, 'Output', 'Output', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'GeneratedSourceFile', 'GeneratedSourceFile', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'GeneratedSourceMap', 'GeneratedSourceMap', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<042a8496>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<042a8496>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('828d4d96', 'playgroundState', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (working, currentCode, initialCode, serverError, currentView, consoleOutput) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          working: working,
          currentCode: currentCode,
          initialCode: initialCode,
          serverError: serverError,
          currentView: currentView,
          consoleOutput: consoleOutput,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'working', 'working', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean;
      }, false);
      $t.defineStructField($static, 'currentCode', 'currentCode', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'initialCode', 'initialCode', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'serverError', 'serverError', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean;
      }, false);
      $t.defineStructField($static, 'buildResult', 'buildResult', function () {
        return $g.playground.BuildResult;
      }, function () {
        return $g.playground.BuildResult;
      }, true);
      $t.defineStructField($static, 'currentView', 'currentView', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      $t.defineStructField($static, 'consoleOutput', 'consoleOutput', function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, function () {
        return $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|9ed61ffb<828d4d96>": true,
          "equals|4|9ed61ffb<2d2c9633>": true,
          "Stringify|2|9ed61ffb<bf97cefa>": true,
          "Mapping|2|9ed61ffb<a5f0d770<any>>": true,
          "Clone|2|9ed61ffb<828d4d96>": true,
          "String|2|9ed61ffb<bf97cefa>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.Start = $t.markpromising(function (element) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.RenderComponent($g.playground.App.Declare(), element)).then(function ($result0) {
                $result = $result0;
                $current = 1;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
    $static.DecorateEditors = $t.markpromising(function () {
      var $result;
      var $temp0;
      var $temp1;
      var editorElement;
      var elements;
      var firstChild;
      var i;
      var initialCode;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        while (true) {
          switch ($current) {
            case 0:
              elements = $global.document.getElementsByTagName('playgroundeditor');
              $current = 1;
              $continue($resolve, $reject);
              return;

            case 1:
              $temp1 = $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer.$range($t.fastbox(0, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Integer), $t.fastbox(elements.length - 1, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.Boolean));
              $current = 2;
              $continue($resolve, $reject);
              return;

            case 2:
              $temp0 = $temp1.Next();
              i = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 3;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 7;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 3:
              editorElement = $t.cast(elements[i.$wrapped], $global.Element, false);
              firstChild = editorElement.firstChild;
              initialCode = $t.fastbox('', $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              if (firstChild != null) {
                $current = 4;
                $continue($resolve, $reject);
                return;
              } else {
                $current = 5;
                $continue($resolve, $reject);
                return;
              }
              break;

            case 4:
              initialCode = $t.fastbox($t.cast(firstChild, $global.Text, false).wholeText, $g.pkg.github.com.Serulian.corelib.branch.master.primitives.String);
              $current = 5;
              $continue($resolve, $reject);
              return;

            case 5:
              editorElement.setAttribute('className', '');
              $promise.maybe($g.pkg.github.com.Serulian.component.HEAD.component.RenderComponent($g.playground.PlaygroundEditor.Declare($g.pkg.github.com.Serulian.corelib.branch.master.collections.Mapping($g.pkg.github.com.Serulian.corelib.branch.master.primitives.String).Empty(), initialCode), editorElement)).then(function ($result0) {
                $result = $result0;
                $current = 6;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 6:
              $current = 2;
              $continue($resolve, $reject);
              return;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
  });
  $module('ace.webidl', function () {
    var $static = this;



  });
  $g.$executeWorkerMethod = function (token) {
    $global.onmessage = function (e) {
      if (!e.isTrusted) {
        $global.close();
        return;
      }
      var data = e.data;
      if (data['token'] != token) {
        throw Error('Invalid token');
      }
      switch (data['action']) {
        case 'invoke':
          var methodId = data['method'];
          var method = $w[methodId];
          var args = data['arguments'].map($t.buildValueFromData);
          var send = function (kind) {
            return function (value) {
              var message = {
                token: token,
                value: $t.buildDataForValue(value),
                kind: kind,
              };
              try {
                $global.postMessage(message);
              } catch (e) {
                if (kind == 'reject') {
                  throw value;
                } else {
                  throw e;
                }
              }
              $global.close();
            };
          };
          method.apply(null, args).then(send('resolve')).catch(send('reject'));
          break;
      }
    };
  };
  var buildPromises = function (items) {
    var seen = {
    };
    var result = [];
    var itemsById = {
    };
    items.forEach(function (item) {
      itemsById[item.id] = item;
    });
    items.forEach(function visit (item) {
      if (seen[item.id]) {
        return;
      }
      seen[item.id] = true;
      item.depends.forEach(function (depId) {
        visit(itemsById[depId]);
      });
      item['promise'] = item['callback']();
    });
    return items.map(function (item) {
      if (!item.depends.length) {
        return item['promise'];
      }
      var current = $promise.resolve();
      item.depends.forEach(function (depId) {
        current = current.then(function (resolved) {
          return itemsById[depId]['promise'];
        });
      });
      return current.then(function (resolved) {
        return item['promise'];
      });
    });
  };
  return $promise.all(buildPromises(moduleInits)).then(function () {
    return $g;
  });
}(this);
if (typeof importScripts === 'function') {
  var runWorker = function () {
    var search = location.search;
    if (!search || (search[0] != '?')) {
      return;
    }
    var searchPairs = search.substr(1).split('&');
    if (searchPairs.length < 1) {
      return;
    }
    for (var i = 0; i < searchPairs.length; ++i) {
      var pair = searchPairs[i].split('=');
      if (pair[0] == '__serulian_async_token') {
        this.Serulian.then(function (global) {
          global.$executeWorkerMethod(pair[1]);
        });
        return;
      }
    }
    close();
  };
  runWorker();
}

//# sourceMappingURL=playground.seru.js.map