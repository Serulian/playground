"use strict";
this.Serulian = (function ($global) {
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
    ensureerror: function (rejected) {
      if (rejected instanceof Error) {
        return $a['wrappederror'].For(rejected);
      }
      return rejected;
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
      if (((value == null) && !opt_allownull) && (type != $t.any)) {
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
        var args = new Array(arguments.length + 1);
        args[0] = null;
        for (var i = 0; i < arguments.length; ++i) {
          args[i + 1] = arguments[i];
        }
        var constructor = Function.prototype.bind.apply(type, args);
        return new constructor();
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
            var cached = module[fullId];
            if (cached) {
              return cached;
            }
            var tpe = buildType(fullId + '>', fullName, generics);
            tpe.$generic = genericType;
            return module[fullId] = tpe;
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
    module.$agent = $newtypebuilder('agent');
    module.$interface = $newtypebuilder('interface');
    module.$type = $newtypebuilder('type');
    creator.call(module);
  };
  $module('codeeditor', function () {
    var $static = this;
    this.$class('7b324bc4', 'codeEditorProps', false, '', function () {
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

    this.$class('54c1e625', 'CodeEditor', false, '', function () {
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
              editor.setTheme($t.unbox($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("ace/theme/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([$t.syncnullcompare($this.props.Theme, function () {
                return $t.fastbox("monokai", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              })]))));
              initialValue = $t.syncnullcompare($t.nullableinvoke($this.initialValue, 'Trim', false, []), function () {
                return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
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
              editor.getSession().setMode($t.assertnotnull($this.props.Mode));
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
                      onChanged($t.fastbox(editor.getSession().getValue(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
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
              $t.nullableinvoke($this.editor, 'setTheme', false, [$t.unbox($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("ace/theme/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([$t.syncnullcompare($this.props.Theme, function () {
                return $t.fastbox("monokai", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
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
              $t.nullableinvoke($t.nullableinvoke($this.editor, 'getSession', false, []), 'setMode', false, [$t.assertnotnull($this.props.Mode)]);
              $current = 2;
              continue syncloop;

            default:
              return;
          }
        }
      };
      $instance.Render = function (context) {
        var $this = this;
        return $g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
          className: $t.fastbox("editor", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
        }), $generator.directempty());
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Declare|1|e429e0b7<54c1e625>": true,
          "Attached|2|e429e0b7<void>": true,
          "Props|3|any": true,
          "PropsUpdated|2|e429e0b7<void>": true,
          "Render|2|e429e0b7<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.attachment.HEAD.attachment', function () {
    var $static = this;
    this.$class('b68a8fb2', 'Attachment', true, '', function (T) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (propName) {
        var instance = new $static();
        instance.propName = propName;
        return instance;
      };
      $static.Global = function (globalId) {
        return $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment(T).new($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("@@", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([globalId])));
      };
      $static.Unique = function (prefix) {
        $g.pkg.github_com.serulian.attachment.HEAD.attachment.attachmentCounter = $t.fastbox($g.pkg.github_com.serulian.attachment.HEAD.attachment.attachmentCounter.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        return $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment(T).new($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("@@", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("-", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([prefix, $g.pkg.github_com.serulian.attachment.HEAD.attachment.attachmentCounter])));
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
              $global.Object.defineProperty(obj, propName.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($global.Boolean).overObject((function () {
                var obj = {
                };
                obj['writable'] = true;
                obj['configurable'] = false;
                obj['enumerable'] = false;
                return obj;
              })()).$wrapped);
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
          "setindex|4|e429e0b7<void>": true,
          "Set|2|e429e0b7<void>": true,
        };
        computed[("Global|1|e429e0b7<b68a8fb2<" + $t.typeid(T)) + ">>"] = true;
        computed[("Unique|1|e429e0b7<b68a8fb2<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        computed[("Get|2|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.attachmentCounter = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        resolve();
      });
    }, 'e9c3608f', []);
  });
  $module('pkg.github_com.serulian.component.HEAD.component', function () {
    var $static = this;
    this.$class('4e7355e9', 'componentReporter', false, '', function () {
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
                var $expr = $g.pkg.github_com.serulian.component.HEAD.component.domNodeComponent.Get(domNode);
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
                var $expr = $t.cast(component, $g.pkg.github_com.serulian.component.HEAD.interfaces.DOMDetached, false);
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
          localasyncloop: while (true) {
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

              case 1:
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
      $instance.NodeUpdated = $t.markpromising(function (virtualNode, domNode) {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
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

              case 1:
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
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "NodeRemoved|2|e429e0b7<void>": true,
          "NodeCreated|2|e429e0b7<void>": true,
          "NodeUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('15354f0c', 'componentContext', false, '', function () {
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
        em = $g.pkg.github_com.serulian.virtualdom.HEAD.eventmanager.EventManager.ForElement(element);
        return $g.pkg.github_com.serulian.component.HEAD.component.componentContext.new(em, $g.pkg.github_com.serulian.component.HEAD.component.componentRenderer.new(), $g.pkg.github_com.serulian.component.HEAD.component.componentReporter.new(em));
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
          "ForElement|1|e429e0b7<15354f0c>": true,
          "Renderer|3|b4d369a3": true,
          "EventManager|3|a4cc135e": true,
        };
        computed[("Get|2|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('a14af6c6', 'componentRenderer', false, '', function () {
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                try {
                  var $expr = $t.cast(component, $g.pkg.github_com.serulian.component.HEAD.interfaces.PropsUpdatable, false);
                  propsUpdatable = $expr;
                } catch ($rejected) {
                  propsUpdatable = null;
                }
                $current = 1;
                continue localasyncloop;

              case 1:
                if (propsUpdatable != null) {
                  $current = 2;
                  continue localasyncloop;
                } else {
                  $current = 5;
                  continue localasyncloop;
                }
                break;

              case 2:
                cached = $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($g.pkg.github_com.serulian.component.HEAD.interfaces.PropsUpdatable).Global($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("cache-", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([pathUnderRoot]))).Get(context);
                if (cached != null) {
                  $current = 3;
                  continue localasyncloop;
                } else {
                  $current = 4;
                  continue localasyncloop;
                }
                break;

              case 3:
                cached.PropsUpdated(propsUpdatable.Props());
                $resolve($t.assertnotnull($g.pkg.github_com.serulian.component.HEAD.component.componentVirtualNode.Get(cached)));
                return;

              case 4:
                $current = 5;
                continue localasyncloop;

              case 5:
                $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.renderable.RenderToVirtualNode(component, context)).then(function ($result0) {
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
                  continue localasyncloop;
                } else {
                  $current = 8;
                  continue localasyncloop;
                }
                break;

              case 7:
                rendered = ($temp0 = rendered.Clone(), $temp0.Key = $t.syncnullcompare(rendered.Key, function () {
                  return $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("__component_propsupdated_", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([$g.pkg.github_com.serulian.component.HEAD.component.propsKeyCounter]));
                }), $temp0);
                $g.pkg.github_com.serulian.component.HEAD.component.propsKeyCounter = $t.fastbox($g.pkg.github_com.serulian.component.HEAD.component.propsKeyCounter.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
                $current = 8;
                continue localasyncloop;

              case 8:
                requiresCallback = $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                try {
                  var $expr = $t.cast(component, $g.pkg.github_com.serulian.component.HEAD.interfaces.DOMAttached, false);
                  attachEvented = $expr;
                } catch ($rejected) {
                  attachEvented = null;
                }
                $current = 9;
                continue localasyncloop;

              case 9:
                if (attachEvented != null) {
                  $current = 10;
                  continue localasyncloop;
                } else {
                  $current = 11;
                  continue localasyncloop;
                }
                break;

              case 10:
                requiresCallback = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                $current = 11;
                continue localasyncloop;

              case 11:
                try {
                  var $expr = $t.cast(component, $g.pkg.github_com.serulian.component.HEAD.interfaces.DOMDetached, false);
                  detachEvented = $expr;
                } catch ($rejected) {
                  detachEvented = null;
                }
                $current = 12;
                continue localasyncloop;

              case 12:
                if (detachEvented != null) {
                  $current = 13;
                  continue localasyncloop;
                } else {
                  $current = 14;
                  continue localasyncloop;
                }
                break;

              case 13:
                requiresCallback = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                $current = 14;
                continue localasyncloop;

              case 14:
                try {
                  var $expr = $t.cast(component, $g.pkg.github_com.serulian.component.HEAD.interfaces.StatefulComponent, false);
                  statefulComponent = $expr;
                } catch ($rejected) {
                  statefulComponent = null;
                }
                $current = 15;
                continue localasyncloop;

              case 15:
                if (statefulComponent != null) {
                  $current = 16;
                  continue localasyncloop;
                } else {
                  $current = 17;
                  continue localasyncloop;
                }
                break;

              case 16:
                requiresCallback = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                $current = 17;
                continue localasyncloop;

              case 17:
                if (requiresCallback.$wrapped) {
                  $current = 18;
                  continue localasyncloop;
                } else {
                  $current = 19;
                  continue localasyncloop;
                }
                break;

              case 18:
                rendered = ($temp1 = rendered.Clone(), $temp1.DOMNodeInserted = context.EventManager().RegisterFunction($t.markpromising(function (data) {
                  var $result;
                  var node;
                  var $current = 0;
                  var $continue = function ($resolve, $reject) {
                    localasyncloop: while (true) {
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
                          $g.pkg.github_com.serulian.component.HEAD.component.componentDOMNode.Set(component, node);
                          $g.pkg.github_com.serulian.component.HEAD.component.domNodeComponent.Set(node, component);
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
                continue localasyncloop;

              case 19:
                $g.pkg.github_com.serulian.component.HEAD.component.componentVirtualNode.Set(component, rendered);
                $g.pkg.github_com.serulian.component.HEAD.component.componentsContext.Set(component, $t.cast(context, $g.pkg.github_com.serulian.component.HEAD.component.componentContext, false));
                if (propsUpdatable != null) {
                  $current = 20;
                  continue localasyncloop;
                } else {
                  $current = 21;
                  continue localasyncloop;
                }
                break;

              case 20:
                $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($g.pkg.github_com.serulian.component.HEAD.interfaces.PropsUpdatable).Global($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("cache-", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([pathUnderRoot]))).Set(context, propsUpdatable);
                $current = 21;
                continue localasyncloop;

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
          "Render|2|e429e0b7<141b3b08>": true,
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              component.StateUpdated(newState);
              currentVirtualNode = $t.assertnotnull($g.pkg.github_com.serulian.component.HEAD.component.componentVirtualNode.Get(component));
              context = $t.assertnotnull($g.pkg.github_com.serulian.component.HEAD.component.componentsContext.Get(component));
              node = $t.assertnotnull($g.pkg.github_com.serulian.component.HEAD.component.componentDOMNode.Get(component));
              $promise.maybe(context.renderer.Render(component, component, $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), context)).then(function ($result0) {
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
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ComputeDiff(updatedVirtualNode, $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(currentVirtualNode))).then(function ($result0) {
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
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ApplyDiff(diff, node, context.diffReporter)).then(function ($result0) {
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
              $g.pkg.github_com.serulian.component.HEAD.component.componentVirtualNode.Set(component, updatedVirtualNode);
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              context = $g.pkg.github_com.serulian.component.HEAD.component.componentContext.ForElement(parent);
              $promise.maybe(context.renderer.Render(component, component, $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), context)).then(function ($result0) {
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
              parentVNode = ($temp0 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Children = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).overArray([rendered]), $temp0.TagName = $t.fastbox(parent.tagName, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0);
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ComputeDiff(parentVNode, $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.NodeWrapper.For(parent))).then(function ($result0) {
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
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ApplyDiff(diff, parent, context.diffReporter)).then(function ($result0) {
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
        $static.componentVirtualNode = $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Unique($t.fastbox('cvn', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
        resolve();
      });
    }, '4f44aa0b', ['e9c3608f']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.componentDOMNode = $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($global.Node).Unique($t.fastbox('cdn', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
        resolve();
      });
    }, '93f3612e', ['e9c3608f']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.domNodeComponent = $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($t.any).Unique($t.fastbox('dnc', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
        resolve();
      });
    }, '500d6b3f', ['e9c3608f']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.componentsContext = $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($g.pkg.github_com.serulian.component.HEAD.component.componentContext).Unique($t.fastbox('cc', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
        resolve();
      });
    }, '088c3dcf', ['e9c3608f']);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.propsKeyCounter = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        resolve();
      });
    }, '06fe44b1', []);
  });
  $module('pkg.github_com.serulian.component.HEAD.interfaces', function () {
    var $static = this;
    this.$interface('1434be21', 'PropsUpdatable', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Props|3|any": true,
          "PropsUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('ff488568', 'DOMAttached', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Attached|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('d417020e', 'DOMDetached', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Detached|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('9ddd6b41', 'StatefulComponent', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|e429e0b7<any>": true,
          "StateUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.corelib.HEAD.collections', function () {
    var $static = this;
    this.$class('662cb8f2', 'listStream', true, '', function (I) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (list) {
        var instance = new $static();
        instance.list = list;
        instance.index = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        return instance;
      };
      $static.forList = function (list) {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.listStream(I).new(list);
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
              return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple(I, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).Build(null, $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));

            case 2:
              $this.index = $t.fastbox($this.index.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple(I, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).Build($this.list.$index($t.fastbox($this.index.$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)), $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));

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
        computed[("Next|2|e429e0b7<e53a4f4a<" + $t.typeid(I)) + ",8e6a0ed7>>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('2696875e', 'sliceStream', true, '', function (I) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (slice) {
        var instance = new $static();
        instance.slice = slice;
        instance.index = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        return instance;
      };
      $static.forStream = function (slice) {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.sliceStream(I).new(slice);
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
              return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple(I, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).Build(null, $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));

            case 2:
              $this.index = $t.fastbox($this.index.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple(I, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).Build($this.slice.$index($t.fastbox($this.index.$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)), $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));

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
        computed[("Next|2|e429e0b7<e53a4f4a<" + $t.typeid(I)) + ",8e6a0ed7>>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('b314d122', 'List', true, 'list', function (T) {
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
              l = $g.pkg.github_com.serulian.corelib.HEAD.collections.List(T).Empty();
              $current = 1;
              continue syncloop;

            case 1:
              $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$range($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(arr.length - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
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
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.List(T).new();
      };
      $static.CopyOf = function (other) {
        var l;
        l = $g.pkg.github_com.serulian.corelib.HEAD.collections.List(T).Empty();
        l.internalArray = other.internalArray.slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
        l.indexArray = other.indexArray.slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                l = $g.pkg.github_com.serulian.corelib.HEAD.collections.List(T).Empty();
                $current = 1;
                continue localasyncloop;

              case 1:
                $temp1 = stream;
                $current = 2;
                continue localasyncloop;

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
                  continue localasyncloop;
                } else {
                  $current = 5;
                  continue localasyncloop;
                }
                break;

              case 4:
                l.Add(item);
                $current = 2;
                continue localasyncloop;

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
        l = $g.pkg.github_com.serulian.corelib.HEAD.collections.List(T).Empty();
        l.internalArray = first.internalArray.slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)).concat(second.internalArray);
        l.indexArray = first.indexArray.slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)).concat(second.indexArray);
        return l;
      };
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $instance.$contains = function (value) {
        var $this = this;
        return $t.fastbox($t.syncnullcompare($this.IndexOf(value), function () {
          return $t.fastbox(-1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        }).$wrapped >= 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
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
                return $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              start = $t.fastbox(start.$wrapped + $this.Count().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              end = $t.fastbox(end.$wrapped + $this.Count().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T).Empty();

            case 6:
              return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T).overArray($this.internalArray.slice(start.$wrapped, end.$wrapped));

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
              finalIndex = $t.fastbox($this.Count().$wrapped + index.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              throw $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError.WithMessage($t.fastbox('Index is out of bounds', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

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
              finalIndex = $t.fastbox($this.Count().$wrapped + index.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              throw $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError.WithMessage($t.fastbox('Index is out of bounds', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

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
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.listStream(T).forList($this);
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
                return $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              });
              foundIndex = $t.fastbox($this.indexArray.indexOf($t.unbox(element), finalIndex.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
        return $t.fastbox($this.internalArray.length, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.Count().$wrapped == 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "bool|4|e429e0b7<8e6a0ed7>": true,
          "contains|4|e429e0b7<8e6a0ed7>": true,
          "setindex|4|e429e0b7<void>": true,
          "Add|2|e429e0b7<void>": true,
          "Remove|2|e429e0b7<void>": true,
          "IndexOf|2|e429e0b7<800df61b>": true,
          "Count|3|800df61b": true,
          "IsEmpty|3|8e6a0ed7": true,
        };
        computed[("Empty|1|e429e0b7<b314d122<" + $t.typeid(T)) + ">>"] = true;
        computed[("CopyOf|1|e429e0b7<b314d122<" + $t.typeid(T)) + ">>"] = true;
        computed[("Of|1|e429e0b7<b314d122<" + $t.typeid(T)) + ">>"] = true;
        computed[("Concat|1|e429e0b7<b314d122<" + $t.typeid(T)) + ">>"] = true;
        computed[("slice|4|e429e0b7<8db223c3<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        computed[("Stream|2|e429e0b7<8470acd1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('f4a75865', 'Set', true, 'set', function (T) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.keyMap = $t.nativenew($global.Object)();
        instance.keys = $g.pkg.github_com.serulian.corelib.HEAD.collections.List(T).Empty();
        return instance;
      };
      $static.Empty = function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Set(T).new();
      };
      $static.Of = $t.markpromising(function (stream) {
        var $result;
        var $temp0;
        var $temp1;
        var element;
        var s;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                s = $g.pkg.github_com.serulian.corelib.HEAD.collections.Set(T).Empty();
                $current = 1;
                continue localasyncloop;

              case 1:
                $temp1 = stream;
                $current = 2;
                continue localasyncloop;

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
                element = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 4;
                  continue localasyncloop;
                } else {
                  $current = 5;
                  continue localasyncloop;
                }
                break;

              case 4:
                s.Add(element);
                $current = 2;
                continue localasyncloop;

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
      $static.From = $t.markpromising(function (streamable) {
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.corelib.HEAD.collections.Set(T).Of(streamable.Stream())).then(function ($result0) {
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
              return $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);

            case 2:
              $this.keys.Add(item);
              $this.keyMap[item.MapKey().String().$wrapped] = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              return $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);

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
              return $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);

            case 2:
              $this.keys.Remove(item);
              $this.keyMap[item.MapKey().String().$wrapped] = null;
              return $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);

            default:
              return;
          }
        }
      };
      $instance.Contains = function (item) {
        var $this = this;
        return $t.fastbox(!($this.keyMap[item.MapKey().String().$wrapped] == null), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
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
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
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
          "Add|2|e429e0b7<8e6a0ed7>": true,
          "Remove|2|e429e0b7<8e6a0ed7>": true,
          "Contains|2|e429e0b7<8e6a0ed7>": true,
          "IsEmpty|3|8e6a0ed7": true,
          "bool|4|e429e0b7<8e6a0ed7>": true,
          "contains|4|e429e0b7<8e6a0ed7>": true,
        };
        computed[("Empty|1|e429e0b7<f4a75865<" + $t.typeid(T)) + ">>"] = true;
        computed[("Of|1|e429e0b7<f4a75865<" + $t.typeid(T)) + ">>"] = true;
        computed[("From|1|e429e0b7<f4a75865<" + $t.typeid(T)) + ">>"] = true;
        computed[("Stream|2|e429e0b7<8470acd1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('0e472dd0', 'Map', true, 'map', function (T, Q) {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.internalObject = $t.nativenew($global.Object)();
        instance.keys = $g.pkg.github_com.serulian.corelib.HEAD.collections.Set(T).Empty();
        return instance;
      };
      $static.Empty = function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Map(T, Q).new();
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
              map = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map(T, Q).new();
              len = $t.fastbox(keys.length, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              $current = 1;
              continue syncloop;

            case 1:
              $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$range($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(len.$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
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
      $instance.Mapping = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($t.fastbox($this.internalObject, $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping(Q)).Clone()).then(function ($result0) {
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
        keyString = key.MapKey().String();
        $this.keys.Add(key);
        $this.internalObject[keyString.$wrapped] = value;
        return;
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
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "RemoveKey|2|e429e0b7<void>": true,
          "HasKey|2|e429e0b7<8e6a0ed7>": true,
          "setindex|4|e429e0b7<void>": true,
          "IsEmpty|3|8e6a0ed7": true,
          "contains|4|e429e0b7<8e6a0ed7>": true,
          "bool|4|e429e0b7<8e6a0ed7>": true,
        };
        computed[((("Empty|1|e429e0b7<0e472dd0<" + $t.typeid(T)) + ",") + $t.typeid(Q)) + ">>"] = true;
        computed[("Mapping|2|e429e0b7<5d7c25c1<" + $t.typeid(Q)) + ">>"] = true;
        computed[("Keys|3|8470acd1<" + $t.typeid(T)) + ">"] = true;
        computed[("index|4|e429e0b7<" + $t.typeid(Q)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('5d7c25c1', 'Mapping', true, 'mapping', function (T) {
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
        return $t.fastbox($t.nativenew($global.Object)(), $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping(T));
      };
      $static.overObject = function (obj) {
        return $t.fastbox(obj, $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping(T));
      };
      $instance.Keys = $t.property(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var index;
        var nativeKeys;
        var $current = 0;
        var $continue = function ($yield, $yieldin, $reject, $done) {
          while (true) {
            switch ($current) {
              case 0:
                nativeKeys = $global.Object.keys($this.$wrapped);
                $current = 1;
                $continue($yield, $yieldin, $reject, $done);
                return;

              case 1:
                $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$exclusiverange($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(nativeKeys.length, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
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
                index = $temp0.First;
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
                $yield($t.fastbox($t.cast(nativeKeys[$t.unbox(index)], $global.String, false), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                $current = 5;
                return;

              case 5:
                $current = 2;
                $continue($yield, $yieldin, $reject, $done);
                return;

              case 6:
                $done();
                return;

              default:
                $done();
                return;
            }
          }
        };
        return $generator.new($continue, true);
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($global.Object.keys($this.$wrapped).length == 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      });
      $instance.Clone = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var copy;
        var existingKey;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                copy = $t.nativenew($global.Object)();
                $current = 1;
                continue localasyncloop;

              case 1:
                $promise.maybe($this.Keys()).then(function ($result0) {
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
                $temp1 = $result;
                $current = 3;
                continue localasyncloop;

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
                existingKey = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 5;
                  continue localasyncloop;
                } else {
                  $current = 6;
                  continue localasyncloop;
                }
                break;

              case 5:
                copy[existingKey.$wrapped] = $this.$index(existingKey);
                $current = 3;
                continue localasyncloop;

              case 6:
                $resolve($t.fastbox(copy, $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping(T)));
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.WithEntry = $t.markpromising(function (key, value) {
        var $this = this;
        var $result;
        var copy;
        var o;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.Clone()).then(function ($result0) {
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
                copy = $result;
                o = copy.$wrapped;
                o[key.$wrapped] = value;
                $resolve(copy);
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
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
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
          "Keys|3|8470acd1<4b279881>": true,
          "IsEmpty|3|8e6a0ed7": true,
          "bool|4|e429e0b7<8e6a0ed7>": true,
        };
        computed[("Empty|1|e429e0b7<5d7c25c1<" + $t.typeid(T)) + ">>"] = true;
        computed[("Clone|2|e429e0b7<5d7c25c1<" + $t.typeid(T)) + ">>"] = true;
        computed[("WithEntry|2|e429e0b7<5d7c25c1<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('8db223c3', 'Slice', true, 'slice', function (T) {
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
        return $t.fastbox($t.nativenew($global.Array)(), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T));
      };
      $static.From = $t.markpromising(function (items) {
        var $result;
        var $temp0;
        var $temp1;
        var i;
        var s;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                s = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T).Empty();
                $current = 1;
                continue localasyncloop;

              case 1:
                $temp1 = items;
                $current = 2;
                continue localasyncloop;

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
                  continue localasyncloop;
                } else {
                  $current = 5;
                  continue localasyncloop;
                }
                break;

              case 4:
                s.$wrapped.push(i);
                $current = 2;
                continue localasyncloop;

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
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T).overArray(arr);
      };
      $static.overArray = function (arr) {
        return $t.fastbox(arr, $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T));
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
                return $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              start = $t.fastbox(start.$wrapped + $this.Length().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              end = $t.fastbox(end.$wrapped + $this.Length().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T).Empty();

            case 6:
              return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice(T).overArray($this.$wrapped.slice(start.$wrapped, end.$wrapped));

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
              finalIndex = $t.fastbox($this.Length().$wrapped + index.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              throw $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError.WithMessage($t.fastbox('Index is out of bounds', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

            case 4:
              return $t.cast($this.$wrapped[finalIndex.$wrapped], T, false);

            default:
              return;
          }
        }
      };
      $instance.Stream = function () {
        var $this = this;
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.sliceStream(T).forStream($this);
      };
      $instance.Length = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.length, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      });
      $instance.IsEmpty = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.Length().$wrapped == 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      });
      $instance.IndexOf = $t.markpromising(function (element) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var foundIndex;
        var index;
        var normalized;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                foundIndex = $t.fastbox($this.$wrapped.indexOf($t.unbox(element), 0), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
                if (foundIndex.$wrapped >= 0) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 2;
                  continue localasyncloop;
                }
                break;

              case 1:
                $resolve(foundIndex);
                return;

              case 2:
                normalized = $t.nativenew($global.Array)();
                $current = 3;
                continue localasyncloop;

              case 3:
                $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$exclusiverange($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $this.Length());
                $current = 4;
                continue localasyncloop;

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
                index = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 6;
                  continue localasyncloop;
                } else {
                  $current = 7;
                  continue localasyncloop;
                }
                break;

              case 6:
                normalized.push($t.unbox($this.$index(index)));
                $current = 4;
                continue localasyncloop;

              case 7:
                foundIndex = $t.fastbox(normalized.indexOf($t.unbox(element), 0), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
                if (foundIndex.$wrapped < 0) {
                  $current = 8;
                  continue localasyncloop;
                } else {
                  $current = 9;
                  continue localasyncloop;
                }
                break;

              case 8:
                $resolve(null);
                return;

              case 9:
                $resolve(foundIndex);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.$contains = $t.markpromising(function (value) {
        var $this = this;
        var $result;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.IndexOf(value)).then(function ($result1) {
                  return $promise.resolve($result1).then(function ($result0) {
                    $result = $t.fastbox($t.asyncnullcompare($result0, $t.fastbox(-1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)).$wrapped >= 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
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
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Length|3|800df61b": true,
          "IsEmpty|3|8e6a0ed7": true,
          "IndexOf|2|e429e0b7<800df61b>": true,
          "contains|4|e429e0b7<8e6a0ed7>": true,
          "bool|4|e429e0b7<8e6a0ed7>": true,
        };
        computed[("Empty|1|e429e0b7<8db223c3<" + $t.typeid(T)) + ">>"] = true;
        computed[("From|1|e429e0b7<8db223c3<" + $t.typeid(T)) + ">>"] = true;
        computed[("ForArray|1|e429e0b7<8db223c3<" + $t.typeid(T)) + ">>"] = true;
        computed[("slice|4|e429e0b7<8db223c3<" + $t.typeid(T)) + ">>"] = true;
        computed[("index|4|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        computed[("Stream|2|e429e0b7<8470acd1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.corelib.HEAD.helpertypes', function () {
    var $static = this;
    this.$class('e53a4f4a', 'Tuple', true, 'tuple', function (T, Q) {
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
        tuple = $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple(T, Q).new();
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
        computed[((("Build|1|e429e0b7<e53a4f4a<" + $t.typeid(T)) + ",") + $t.typeid(Q)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('3a749896', 'IntStream', false, '$intstream', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.IntStream.new(start, end, start);
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
              t = $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple($g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).Build($this.current, $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));
              $this.current = $t.fastbox($this.current.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              return t;

            case 2:
              return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.Tuple($g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).Build($this.current, $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));

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
          "OverRange|1|e429e0b7<3a749896>": true,
          "Next|2|e429e0b7<e53a4f4a<800df61b,8e6a0ed7>>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('7f265bdb', 'SimpleError', false, '', function () {
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
        return $t.box(message, $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError);
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "WithMessage|1|e429e0b7<7f265bdb>": true,
          "Message|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('47cf4db1', 'WrappedError', false, 'wrappederror', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $global.Error;
      };
      $static.For = function (err) {
        return $t.fastbox(err, $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.WrappedError);
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.message, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "For|1|e429e0b7<47cf4db1>": true,
          "Message|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.corelib.HEAD.interfaces', function () {
    var $static = this;
    this.$interface('07af289b', 'Stringable', false, 'stringable', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('8470acd1', 'Stream', true, 'stream', function (T) {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Next|2|e429e0b7<e53a4f4a<" + $t.typeid(T)) + ",8e6a0ed7>>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('d9f44faa', 'Streamable', true, 'streamable', function (T) {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Stream|2|e429e0b7<8470acd1<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('1d7e0170', 'Mappable', false, 'mappable', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "MapKey|3|07af289b": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('5b9331b5', 'Awaitable', true, 'awaitable', function (T) {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
        };
        computed[("Then|2|e429e0b7<5b9331b5<" + $t.typeid(T)) + ">>"] = true;
        computed[("Catch|2|e429e0b7<5b9331b5<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('1bbfc8c2', 'Error', false, 'error', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Message|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('a55fe9b7', 'Releasable', false, 'releasable', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Release|2|e429e0b7<void>": true,
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
  $module('pkg.github_com.serulian.corelib.HEAD.native', function () {
    var $static = this;
    $static.ESObjectLiteral = function (mapping) {
      return $global.JSON.parse($g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON.Get().Stringify(mapping).$wrapped);
    };
  });
  $module('pkg.github_com.serulian.corelib.HEAD.primitives', function () {
    var $static = this;
    this.$class('e429e0b7', 'functionType', true, 'function', function (T) {
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

    this.$type('800df61b', 'Integer', false, 'int', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.IntStream.OverRange(start, end);
      };
      $static.$exclusiverange = function (start, end) {
        return $g.pkg.github_com.serulian.corelib.HEAD.helpertypes.IntStream.OverRange(start, $t.fastbox(end.$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
      };
      $static.$plus = function (left, right) {
        return $t.fastbox(left.$wrapped + right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $static.$minus = function (left, right) {
        return $t.fastbox(left.$wrapped - right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $static.$times = function (left, right) {
        return $t.fastbox(left.$wrapped * right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $static.$div = function (left, right) {
        return $t.fastbox(left.$wrapped / right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64).Floor();
      };
      $static.$mod = function (left, right) {
        return $t.fastbox(left.$wrapped % right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $static.$compare = function (left, right) {
        return $t.fastbox(left.$wrapped - right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $static.$equals = function (left, right) {
        return $t.box(left.$wrapped == right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $instance.String = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toString(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $instance.MapKey = $t.property(function () {
        var $this = this;
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($t.fastbox('int::', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $this.String());
      });
      $instance.AsFloat = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "range|4|e429e0b7<8470acd1<800df61b>>": true,
          "exclusiverange|4|e429e0b7<8470acd1<800df61b>>": true,
          "plus|4|e429e0b7<800df61b>": true,
          "minus|4|e429e0b7<800df61b>": true,
          "times|4|e429e0b7<800df61b>": true,
          "div|4|e429e0b7<800df61b>": true,
          "mod|4|e429e0b7<800df61b>": true,
          "compare|4|e429e0b7<800df61b>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "String|2|e429e0b7<4b279881>": true,
          "MapKey|3|07af289b": true,
          "AsFloat|2|e429e0b7<7f057249>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('7f057249', 'Float64', false, 'float64', function () {
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
        return $t.fastbox($this.$wrapped.toString(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $static.$plus = function (left, right) {
        return $t.fastbox(left.$wrapped + right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64);
      };
      $static.$minus = function (left, right) {
        return $t.fastbox(left.$wrapped - right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64);
      };
      $static.$times = function (left, right) {
        return $t.fastbox(left.$wrapped * right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64);
      };
      $static.$div = function (left, right) {
        return $t.fastbox(left.$wrapped / right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64);
      };
      $static.$equals = function (left, right) {
        return $t.box(left.$wrapped == right.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $static.$compare = function (left, right) {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Float64.$minus(left, right).Floor();
      };
      $instance.Floor = function () {
        var $this = this;
        return $t.fastbox($global.Math.floor($this.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $instance.Ceil = function () {
        var $this = this;
        return $t.fastbox($global.Math.ceil($this.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      $instance.Round = function () {
        var $this = this;
        return $t.fastbox($global.Math.round($this.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "String|2|e429e0b7<4b279881>": true,
          "plus|4|e429e0b7<7f057249>": true,
          "minus|4|e429e0b7<7f057249>": true,
          "times|4|e429e0b7<7f057249>": true,
          "div|4|e429e0b7<7f057249>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "compare|4|e429e0b7<800df61b>": true,
          "Floor|2|e429e0b7<800df61b>": true,
          "Ceil|2|e429e0b7<800df61b>": true,
          "Round|2|e429e0b7<800df61b>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('8e6a0ed7', 'Boolean', false, 'bool', function () {
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
        return $t.fastbox($this.$wrapped.toString(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $static.$equals = function (first, second) {
        return $t.box(first.$wrapped == second.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $static.$bool = function (value) {
        return value;
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "String|2|e429e0b7<4b279881>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "bool|4|e429e0b7<8e6a0ed7>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('4b279881', 'String', false, 'string', function () {
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
        return $t.box(first.$wrapped == second.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $static.$plus = function (first, second) {
        return $t.fastbox(first.$wrapped + second.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
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
                return $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              start = $t.fastbox(start.$wrapped + $this.Length().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              end = $t.fastbox(end.$wrapped + $this.Length().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

            case 6:
              return $t.fastbox($this.$wrapped.substring(start.$wrapped, end.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

            default:
              return;
          }
        }
      };
      $static.$bool = function (value) {
        return $t.fastbox(!value.IsEmpty().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $instance.Trim = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.trim(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $instance.ToLowerCase = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toLowerCase(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $instance.ToUpperCase = function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.toUpperCase(), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $instance.Split = function (separator, limit) {
        var $this = this;
        var arr;
        arr = $this.$wrapped.split(separator.$wrapped, $t.syncnullcompare(limit, function () {
          return $t.fastbox(-1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        }).$wrapped);
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).ForArray(arr);
      };
      $instance.HasPrefix = function (prefix) {
        var $this = this;
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.$slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), prefix.Length()), prefix);
      };
      $instance.HasSuffix = function (suffix) {
        var $this = this;
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.$slice($t.fastbox($this.Length().$wrapped - suffix.Length().$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $this.Length()), suffix);
      };
      $instance.Contains = function (otherString) {
        var $this = this;
        var index;
        index = $t.fastbox($this.$wrapped.indexOf(otherString.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        return $t.fastbox(index.$wrapped >= 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      };
      $instance.$contains = function (other) {
        var $this = this;
        return $this.Contains(other);
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
        return $t.fastbox($this.Length().$wrapped == 0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      });
      $instance.Length = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.length, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "plus|4|e429e0b7<4b279881>": true,
          "slice|4|e429e0b7<4b279881>": true,
          "bool|4|e429e0b7<8e6a0ed7>": true,
          "Trim|2|e429e0b7<4b279881>": true,
          "ToLowerCase|2|e429e0b7<4b279881>": true,
          "ToUpperCase|2|e429e0b7<4b279881>": true,
          "Split|2|e429e0b7<8db223c3<4b279881>>": true,
          "HasPrefix|2|e429e0b7<8e6a0ed7>": true,
          "HasSuffix|2|e429e0b7<8e6a0ed7>": true,
          "Contains|2|e429e0b7<8e6a0ed7>": true,
          "contains|4|e429e0b7<8e6a0ed7>": true,
          "String|2|e429e0b7<4b279881>": true,
          "MapKey|3|07af289b": true,
          "IsEmpty|3|8e6a0ed7": true,
          "Length|3|800df61b": true,
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
            $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$range($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(pieces.Length().$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
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
            return $t.fastbox(overallPieces.join(''), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

          default:
            return;
        }
      }
    };
  });
  $module('pkg.github_com.serulian.corelib.HEAD.promise', function () {
    var $static = this;
    this.$type('890013f6', 'Promise', true, 'promise', function (T) {
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
        return $t.fastbox(native, $g.pkg.github_com.serulian.corelib.HEAD.promise.Promise(T));
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
        computed[("Execute|1|e429e0b7<890013f6<" + $t.typeid(T)) + ">>"] = true;
        computed[("Then|2|e429e0b7<5b9331b5<" + $t.typeid(T)) + ">>"] = true;
        computed[("Catch|2|e429e0b7<5b9331b5<" + $t.typeid(T)) + ">>"] = true;
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.corelib.HEAD.serialization', function () {
    var $static = this;
    this.$class('42126b74', 'JSON', false, 'json', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        return instance;
      };
      $static.Get = function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON.new();
      };
      $instance.Stringify = function (value) {
        var $this = this;
        return $t.fastbox($global.JSON.stringify(value.$wrapped, $t.dynamicaccess($global.__serulian_internal, 'autoUnbox', false)), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      };
      $instance.Parse = function (value) {
        var $this = this;
        return $t.fastbox($global.JSON.parse(value.$wrapped, $t.dynamicaccess($global.__serulian_internal, 'autoBox', false)), $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any));
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Get|1|e429e0b7<42126b74>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Parse|2|e429e0b7<5d7c25c1<any>>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('8df647da', 'Stringifier', false, '$stringifier', function () {
      var $static = this;
      $static.Get = function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON.new();
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Get|1|e429e0b7<8df647da>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('c182791a', 'Parser', false, '$parser', function () {
      var $static = this;
      $static.Get = function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON.new();
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Get|1|e429e0b7<c182791a>": true,
          "Parse|2|e429e0b7<5d7c25c1<any>>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.debuglib.HEAD.debuglib', function () {
    var $static = this;
    $static.Log = function (value) {
      $global.console.log(value);
      return;
    };
  });
  $module('pkg.github_com.serulian.request.HEAD.request', function () {
    var $static = this;
    this.$class('a1ab1974', 'HttpError', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (response) {
        var instance = new $static();
        instance.response = response;
        return instance;
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("Got non-OK response: ", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(": ", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([$this.response.StatusCode(), $this.response.StatusText()]));
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Message|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('900c2582', 'RequestError', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        return instance;
      };
      $instance.Message = $t.property(function () {
        var $this = this;
        return $t.fastbox('An error occurred when constructing the request', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Message|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('9c18efee', 'Request', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (method, url) {
        var instance = new $static();
        instance.method = method;
        instance.url = url;
        return instance;
      };
      $static.For = function (method, url) {
        return $g.pkg.github_com.serulian.request.HEAD.request.Request.new(method, url);
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.corelib.HEAD.promise.Promise($g.pkg.github_com.serulian.request.HEAD.request.Response).Execute(function (resolve, rejectNow) {
                  var xhr;
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
                          resolve($t.box($g.pkg.github_com.serulian.request.HEAD.request.responseData.new($t.fastbox(xhr.status, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(xhr.statusText, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(xhr.responseText, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), $g.pkg.github_com.serulian.request.HEAD.request.Response));
                          $current = 2;
                          continue syncloop;

                        default:
                          return;
                      }
                    }
                  });
                  xhr.addEventListener('error', function () {
                    rejectNow($g.pkg.github_com.serulian.request.HEAD.request.RequestError.new());
                    return;
                  });
                  xhr.send($t.unbox($this.body));
                  return;
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
          localasyncloop: while (true) {
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
          "For|1|e429e0b7<9c18efee>": true,
          "WithBody|2|e429e0b7<9c18efee>": true,
          "ExecuteAndReturn|2|e429e0b7<890013f6<ab6a3e36>>": true,
          "Execute|2|e429e0b7<ab6a3e36>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('ab6a3e36', 'Response', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $g.pkg.github_com.serulian.request.HEAD.request.responseData;
      };
      $instance.StatusCode = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.request.HEAD.request.responseData).StatusCode;
      });
      $instance.StatusText = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.request.HEAD.request.responseData).StatusText;
      });
      $instance.Text = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.request.HEAD.request.responseData).Text;
      });
      $instance.RejectOnFailure = function () {
        var $this = this;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$div($this.StatusCode(), $t.fastbox(100, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)).$wrapped != 2) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              throw $g.pkg.github_com.serulian.request.HEAD.request.HttpError.new($this);

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
          "StatusCode|3|800df61b": true,
          "StatusText|3|4b279881": true,
          "Text|3|4b279881": true,
          "RejectOnFailure|2|e429e0b7<ab6a3e36>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('4e27afa6', 'responseData', false, '', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer;
      }, false);
      $t.defineStructField($static, 'StatusText', 'StatusText', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'Text', 'Text', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<4e27afa6>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<4e27afa6>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.Get = $t.markpromising(function (url) {
      var $result;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Request.For($t.fastbox('GET', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), url).Execute()).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Request.For($t.fastbox('POST', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), url).WithBody(body).Execute()).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Request.For($t.fastbox('PUT', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), url).WithBody(body).Execute()).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Request.For($t.fastbox('PATCH', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), url).WithBody(body).Execute()).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Request.For($t.fastbox('DELETE', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), url).Execute()).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Get(url)).then(function ($result0) {
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
  $module('pkg.github_com.serulian.virtualdom.HEAD.decorators', function () {
    var $static = this;
    this.$class('a5d9aba9', 'elementRenderer', false, '', function () {
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.renderable.RenderToVirtualNode($this.value, context)).then(function ($result0) {
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
          "Render|2|e429e0b7<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.If = function (value, condition) {
      var $temp0;
      return condition.$wrapped ? value : ($temp0 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Text = $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0);
    };
    $static.DynamicAttributes = $t.markpromising(function (value, attributes) {
      var $result;
      var $temp0;
      var $temp1;
      var attributeName;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $current = 1;
              continue localasyncloop;

            case 1:
              $promise.maybe(attributes.Keys()).then(function ($result0) {
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
              $temp1 = $result;
              $current = 3;
              continue localasyncloop;

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
              attributeName = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 5;
                continue localasyncloop;
              } else {
                $current = 9;
                continue localasyncloop;
              }
              break;

            case 5:
              if ($t.syncnullcompare(attributes.$index(attributeName), function () {
                return $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              }).$wrapped) {
                $current = 6;
                continue localasyncloop;
              } else {
                $current = 8;
                continue localasyncloop;
              }
              break;

            case 6:
              $promise.maybe(value.props.WithEntry(attributeName, $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean))).then(function ($result0) {
                $result = value.props = $result0;
                $current = 7;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 7:
              $current = 8;
              continue localasyncloop;

            case 8:
              $current = 3;
              continue localasyncloop;

            case 9:
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
        $resolve(($temp0 = $g.pkg.github_com.serulian.virtualdom.HEAD.decorators.elementRenderer.new($t.markpromising(function (virtualNode) {
          var $result;
          var $current = 0;
          var $continue = function ($resolve, $reject) {
            localasyncloop: while (true) {
              switch ($current) {
                case 0:
                  if (!condition.$wrapped) {
                    $current = 1;
                    continue localasyncloop;
                  } else {
                    $current = 2;
                    continue localasyncloop;
                  }
                  break;

                case 1:
                  $resolve(virtualNode);
                  return;

                case 2:
                  $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.addStyle(virtualNode, $t.fastbox('display', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox('none', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              attributes = $t.syncnullcompare(virtualNode.Attributes, function () {
                return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty();
              });
              styleString = $t.syncnullcompare(attributes.$index($t.fastbox('style', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), function () {
                return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              });
              if (!styleString.IsEmpty().$wrapped) {
                $current = 1;
                continue localasyncloop;
              } else {
                $current = 2;
                continue localasyncloop;
              }
              break;

            case 1:
              styleString = $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus(styleString, $t.fastbox('; ', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
              $current = 2;
              continue localasyncloop;

            case 2:
              $promise.maybe(attributes.WithEntry($t.fastbox('style', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(": ", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([styleString, styleName, styleValue])))).then(function ($result0) {
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
  $module('pkg.github_com.serulian.virtualdom.HEAD.diff', function () {
    var $static = this;
    this.$interface('e88e722c', 'DiffReporter', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "NodeRemoved|2|e429e0b7<void>": true,
          "NodeCreated|2|e429e0b7<void>": true,
          "NodeUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('5175f3b3', 'AttributeDiff', false, '', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'Value', 'Value', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<5175f3b3>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<5175f3b3>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('190e9ac0', 'Diff', false, '', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'NodeIndex', 'NodeIndex', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer;
      }, false);
      $t.defineStructField($static, 'ReplacementNode', 'ReplacementNode', function () {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode;
      }, function () {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode;
      }, true);
      $t.defineStructField($static, 'Children', 'Children', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff);
      }, false);
      $t.defineStructField($static, 'Attributes', 'Attributes', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff);
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<190e9ac0>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<190e9ac0>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.generateId = function () {
      $g.pkg.github_com.serulian.virtualdom.HEAD.diff.nodeCounter = $t.fastbox($g.pkg.github_com.serulian.virtualdom.HEAD.diff.nodeCounter.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
      return $g.pkg.github_com.serulian.virtualdom.HEAD.diff.nodeCounter.String();
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              if (vNode.TagName == null) {
                $current = 1;
                continue localasyncloop;
              } else {
                $current = 2;
                continue localasyncloop;
              }
              break;

            case 1:
              $resolve($global.document.createTextNode($t.assertnotnull(vNode.Text).$wrapped));
              return;

            case 2:
              node = $global.document.createElement($t.assertnotnull(vNode.TagName).$wrapped);
              if (vNode.Key != null) {
                $current = 3;
                continue localasyncloop;
              } else {
                $current = 4;
                continue localasyncloop;
              }
              break;

            case 3:
              $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.keyAttachment.Set(node, $t.assertnotnull(vNode.Key));
              $current = 4;
              continue localasyncloop;

            case 4:
              attributes = vNode.Attributes;
              if (attributes != null) {
                $current = 5;
                continue localasyncloop;
              } else {
                $current = 14;
                continue localasyncloop;
              }
              break;

            case 5:
              $current = 6;
              continue localasyncloop;

            case 6:
              $promise.maybe(attributes.Keys()).then(function ($result0) {
                $result = $result0;
                $current = 7;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 7:
              $temp1 = $result;
              $current = 8;
              continue localasyncloop;

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
              attrName = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 10;
                continue localasyncloop;
              } else {
                $current = 13;
                continue localasyncloop;
              }
              break;

            case 10:
              attrValue = attributes.$index(attrName);
              if (attrValue == null) {
                $current = 11;
                continue localasyncloop;
              } else {
                $current = 12;
                continue localasyncloop;
              }
              break;

            case 11:
              $current = 8;
              continue localasyncloop;

            case 12:
              node.setAttribute(attrName.$wrapped, $t.assertnotnull(attrValue).$wrapped);
              $current = 8;
              continue localasyncloop;

            case 13:
              $current = 14;
              continue localasyncloop;

            case 14:
              elementPath = $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus(parentPath, $t.fastbox('.', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), $g.pkg.github_com.serulian.virtualdom.HEAD.diff.generateId());
              $g.pkg.github_com.serulian.virtualdom.HEAD.internal.setDOMPath(node, elementPath);
              children = vNode.Children;
              if (children != null) {
                $current = 15;
                continue localasyncloop;
              } else {
                $current = 23;
                continue localasyncloop;
              }
              break;

            case 15:
              $current = 16;
              continue localasyncloop;

            case 16:
              $temp3 = children.Stream();
              $current = 17;
              continue localasyncloop;

            case 17:
              $promise.maybe($temp3.Next()).then(function ($result0) {
                $temp2 = $result0;
                $result = $temp2;
                $current = 18;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 18:
              child = $temp2.First;
              if ($temp2.Second.$wrapped) {
                $current = 19;
                continue localasyncloop;
              } else {
                $current = 22;
                continue localasyncloop;
              }
              break;

            case 19:
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.buildDOM(child, elementPath, reporter)).then(function ($result0) {
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
              built = $result;
              node.appendChild(built);
              $t.nullableinvoke(reporter, 'NodeCreated', true, [child, built]).then(function ($result0) {
                $result = $result0;
                $current = 21;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 21:
              $current = 17;
              continue localasyncloop;

            case 22:
              $current = 23;
              continue localasyncloop;

            case 23:
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.computeDiff(updated, existing, $t.fastbox(-1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer))).then(function ($result0) {
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $temp0 = diff.Type;
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($temp0, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_SAME).$wrapped) {
                $current = 1;
                continue localasyncloop;
              } else {
                $current = 3;
                continue localasyncloop;
              }
              break;

            case 1:
              $current = 2;
              continue localasyncloop;

            case 3:
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($temp0, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_THUNK).$wrapped) {
                $current = 4;
                continue localasyncloop;
              } else {
                $current = 25;
                continue localasyncloop;
              }
              break;

            case 4:
              $current = 5;
              continue localasyncloop;

            case 5:
              $temp2 = diff.Attributes.Stream();
              $current = 6;
              continue localasyncloop;

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
                continue localasyncloop;
              } else {
                $current = 12;
                continue localasyncloop;
              }
              break;

            case 8:
              if (attrDiff.Value == null) {
                $current = 9;
                continue localasyncloop;
              } else {
                $current = 11;
                continue localasyncloop;
              }
              break;

            case 9:
              $t.cast(domNode, $global.Element, false).removeAttribute(attrDiff.Name.$wrapped);
              $current = 10;
              continue localasyncloop;

            case 10:
              $current = 6;
              continue localasyncloop;

            case 11:
              $t.cast(domNode, $global.Element, false).setAttribute(attrDiff.Name.$wrapped, $t.assertnotnull(attrDiff.Value).$wrapped);
              $current = 10;
              continue localasyncloop;

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
              continue localasyncloop;

            case 14:
              $temp4 = diff.Children.Stream();
              $current = 15;
              continue localasyncloop;

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
                continue localasyncloop;
              } else {
                $current = 24;
                continue localasyncloop;
              }
              break;

            case 17:
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals(childDiff.Type, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_CREATE_NODE).$wrapped) {
                $current = 18;
                continue localasyncloop;
              } else {
                $current = 20;
                continue localasyncloop;
              }
              break;

            case 18:
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ApplyDiff(childDiff, domNode, reporter)).then(function ($result0) {
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
              continue localasyncloop;

            case 20:
              child = $t.cast(domNode, $global.Element, false).childNodes[childDiff.NodeIndex.$wrapped];
              if (child == null) {
                $current = 21;
                continue localasyncloop;
              } else {
                $current = 22;
                continue localasyncloop;
              }
              break;

            case 21:
              $reject($g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.DOMError.WithMessage($t.fastbox('Missing expected child', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)));
              return;

            case 22:
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ApplyDiff(childDiff, $t.assertnotnull(child), reporter)).then(function ($result0) {
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
              continue localasyncloop;

            case 24:
              $current = 2;
              continue localasyncloop;

            case 25:
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($temp0, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_REMOVE_NODE).$wrapped) {
                $current = 26;
                continue localasyncloop;
              } else {
                $current = 29;
                continue localasyncloop;
              }
              break;

            case 26:
              parent = domNode.parentNode;
              if (parent != null) {
                $current = 27;
                continue localasyncloop;
              } else {
                $current = 28;
                continue localasyncloop;
              }
              break;

            case 27:
              parent.removeChild(domNode);
              $t.nullableinvoke(reporter, 'NodeRemoved', false, [domNode]);
              $current = 28;
              continue localasyncloop;

            case 28:
              $current = 2;
              continue localasyncloop;

            case 29:
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($temp0, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_CREATE_NODE).$wrapped) {
                $current = 30;
                continue localasyncloop;
              } else {
                $current = 38;
                continue localasyncloop;
              }
              break;

            case 30:
              parentPath = $g.pkg.github_com.serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.buildDOM($t.assertnotnull(diff.ReplacementNode), parentPath, reporter)).then(function ($result0) {
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
                continue localasyncloop;
              } else {
                $current = 34;
                continue localasyncloop;
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
                continue localasyncloop;
              } else {
                $current = 37;
                continue localasyncloop;
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
              continue localasyncloop;

            case 37:
              $current = 2;
              continue localasyncloop;

            case 38:
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($temp0, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_REPLACE_NODE).$wrapped) {
                $current = 39;
                continue localasyncloop;
              } else {
                $current = 2;
                continue localasyncloop;
              }
              break;

            case 39:
              parent = domNode.parentNode;
              if (parent != null) {
                $current = 40;
                continue localasyncloop;
              } else {
                $current = 43;
                continue localasyncloop;
              }
              break;

            case 40:
              parentPath = $g.pkg.github_com.serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.buildDOM($t.assertnotnull(diff.ReplacementNode), parentPath, reporter)).then(function ($result0) {
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
              continue localasyncloop;

            case 43:
              $current = 2;
              continue localasyncloop;

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
            return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus(node.TagName(), $t.fastbox(':', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), index.String());

          case 4:
            return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($t.assertnotnull(node.TextData()), $t.fastbox(':', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), index.String());

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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              existingVirtual = existing.Virtual();
              if (existingVirtual != null) {
                $current = 1;
                continue localasyncloop;
              } else {
                $current = 4;
                continue localasyncloop;
              }
              break;

            case 1:
              if ($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.$equals(existingVirtual, updatedNode).$wrapped) {
                $current = 2;
                continue localasyncloop;
              } else {
                $current = 3;
                continue localasyncloop;
              }
              break;

            case 2:
              $resolve(($temp0 = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_SAME, parentIndex, $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()), $temp0.ReplacementNode = updatedNode, $temp0));
              return;

            case 3:
              $current = 4;
              continue localasyncloop;

            case 4:
              updated = $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(updatedNode);
              updatedKey = $t.syncnullcompare(updated.Key(), function () {
                return $t.fastbox('---updating---', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              });
              existingKey = $t.syncnullcompare(existing.Key(), function () {
                return $t.fastbox('---existing--', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              });
              needsReplacement = $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals(updatedKey, existingKey).$wrapped) {
                $current = 5;
                continue localasyncloop;
              } else {
                $current = 53;
                continue localasyncloop;
              }
              break;

            case 5:
              needsReplacement = $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              $current = 6;
              continue localasyncloop;

            case 6:
              if (needsReplacement.$wrapped) {
                $current = 7;
                continue localasyncloop;
              } else {
                $current = 8;
                continue localasyncloop;
              }
              break;

            case 7:
              $resolve(($temp1 = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_REPLACE_NODE, parentIndex, $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()), $temp1.ReplacementNode = updatedNode, $temp1));
              return;

            case 8:
              attributeDiffs = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff).Empty();
              if (existing.IsElement().$wrapped) {
                $current = 9;
                continue localasyncloop;
              } else {
                $current = 28;
                continue localasyncloop;
              }
              break;

            case 9:
              existingAttributes = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty();
              $current = 10;
              continue localasyncloop;

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
              continue localasyncloop;

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
                continue localasyncloop;
              } else {
                $current = 17;
                continue localasyncloop;
              }
              break;

            case 14:
              existingAttributes.$setindex(attributeName, existing.GetAttribute(attributeName));
              if (updated.GetAttribute(attributeName) == null) {
                $current = 15;
                continue localasyncloop;
              } else {
                $current = 16;
                continue localasyncloop;
              }
              break;

            case 15:
              attributeDiffs.Add($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff.new(attributeName));
              $current = 16;
              continue localasyncloop;

            case 16:
              $current = 12;
              continue localasyncloop;

            case 17:
              $current = 18;
              continue localasyncloop;

            case 18:
              $promise.maybe(updated.AttributeNames()).then(function ($result0) {
                $result = $result0.Stream();
                $current = 19;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 19:
              $temp5 = $result;
              $current = 20;
              continue localasyncloop;

            case 20:
              $promise.maybe($temp5.Next()).then(function ($result0) {
                $temp4 = $result0;
                $result = $temp4;
                $current = 21;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 21:
              attributeName = $temp4.First;
              if ($temp4.Second.$wrapped) {
                $current = 22;
                continue localasyncloop;
              } else {
                $current = 27;
                continue localasyncloop;
              }
              break;

            case 22:
              attributeValue = updated.GetAttribute(attributeName);
              existingValue = existingAttributes.$index(attributeName);
              if (attributeValue == null) {
                $current = 23;
                continue localasyncloop;
              } else {
                $current = 24;
                continue localasyncloop;
              }
              break;

            case 23:
              $current = 20;
              continue localasyncloop;

            case 24:
              if ((existingValue == null) || !$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($t.assertnotnull(attributeValue), $t.assertnotnull(existingValue)).$wrapped) {
                $current = 25;
                continue localasyncloop;
              } else {
                $current = 26;
                continue localasyncloop;
              }
              break;

            case 25:
              attributeDiffs.Add(($temp6 = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff.new(attributeName), $temp6.Value = attributeValue, $temp6));
              $current = 26;
              continue localasyncloop;

            case 26:
              $current = 20;
              continue localasyncloop;

            case 27:
              $current = 28;
              continue localasyncloop;

            case 28:
              childInPlaceDiffs = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty();
              childRemovalDiffs = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty();
              childInsertionDiffs = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty();
              updatedByKey = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Empty();
              keysHandled = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty();
              index = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              updatedChildren = updatedNode.Children;
              if (updatedChildren != null) {
                $current = 29;
                continue localasyncloop;
              } else {
                $current = 35;
                continue localasyncloop;
              }
              break;

            case 29:
              $current = 30;
              continue localasyncloop;

            case 30:
              $temp8 = updatedChildren.Stream();
              $current = 31;
              continue localasyncloop;

            case 31:
              $promise.maybe($temp8.Next()).then(function ($result0) {
                $temp7 = $result0;
                $result = $temp7;
                $current = 32;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 32:
              child = $temp7.First;
              if ($temp7.Second.$wrapped) {
                $current = 33;
                continue localasyncloop;
              } else {
                $current = 34;
                continue localasyncloop;
              }
              break;

            case 33:
              updatedByKey.$setindex($g.pkg.github_com.serulian.virtualdom.HEAD.diff.getInferredNodeKey($g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(child), index), child);
              index = $t.fastbox(index.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              $current = 31;
              continue localasyncloop;

            case 34:
              $current = 35;
              continue localasyncloop;

            case 35:
              $current = 36;
              continue localasyncloop;

            case 36:
              $temp10 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$range($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(existing.ChildCount().$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
              $current = 37;
              continue localasyncloop;

            case 37:
              $temp9 = $temp10.Next();
              counter = $temp9.First;
              if ($temp9.Second.$wrapped) {
                $current = 38;
                continue localasyncloop;
              } else {
                $current = 42;
                continue localasyncloop;
              }
              break;

            case 38:
              index = $t.fastbox((existing.ChildCount().$wrapped - 1) - counter.$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              child = existing.GetChild(index);
              childKey = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.getInferredNodeKey(child, index);
              vNode = updatedByKey.$index(childKey);
              if (vNode == null) {
                $current = 39;
                continue localasyncloop;
              } else {
                $current = 40;
                continue localasyncloop;
              }
              break;

            case 39:
              childRemovalDiffs.Add($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_REMOVE_NODE, index, $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()));
              $current = 37;
              continue localasyncloop;

            case 40:
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.computeDiff($t.assertnotnull(vNode), child, index)).then(function ($result0) {
                $result = keysHandled.$setindex(childKey, $result0);
                $current = 41;
                $continue($resolve, $reject);
                return;
              }).catch(function (err) {
                $reject(err);
                return;
              });
              return;

            case 41:
              $current = 37;
              continue localasyncloop;

            case 42:
              updatedChildren = updatedNode.Children;
              if (updatedChildren != null) {
                $current = 43;
                continue localasyncloop;
              } else {
                $current = 52;
                continue localasyncloop;
              }
              break;

            case 43:
              $current = 44;
              continue localasyncloop;

            case 44:
              $temp12 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$range($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(updatedChildren.Length().$wrapped - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
              $current = 45;
              continue localasyncloop;

            case 45:
              $temp11 = $temp12.Next();
              index = $temp11.First;
              if ($temp11.Second.$wrapped) {
                $current = 46;
                continue localasyncloop;
              } else {
                $current = 51;
                continue localasyncloop;
              }
              break;

            case 46:
              child = updatedChildren.$index(index);
              childKey = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.getInferredNodeKey($g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper.For(child), index);
              addCreate = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              handledDiff = keysHandled.$index(childKey);
              if (handledDiff != null) {
                $current = 47;
                continue localasyncloop;
              } else {
                $current = 48;
                continue localasyncloop;
              }
              break;

            case 47:
              childInPlaceDiffs.Add(handledDiff);
              addCreate = $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              $current = 48;
              continue localasyncloop;

            case 48:
              if (addCreate.$wrapped) {
                $current = 49;
                continue localasyncloop;
              } else {
                $current = 50;
                continue localasyncloop;
              }
              break;

            case 49:
              childInsertionDiffs.Add(($temp13 = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_CREATE_NODE, index, $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Empty(), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.diff.AttributeDiff).Empty()), $temp13.ReplacementNode = child, $temp13));
              $current = 50;
              continue localasyncloop;

            case 50:
              $current = 45;
              continue localasyncloop;

            case 51:
              $current = 52;
              continue localasyncloop;

            case 52:
              childrenDiffs = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Concat($g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff).Concat(childInPlaceDiffs, childRemovalDiffs), childInsertionDiffs);
              $resolve(($temp14 = $g.pkg.github_com.serulian.virtualdom.HEAD.diff.Diff.new($g.pkg.github_com.serulian.virtualdom.HEAD.diff.DIFF_THUNK, parentIndex, childrenDiffs.$slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null), attributeDiffs.$slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null)), $temp14.ReplacementNode = updatedNode, $temp14));
              return;

            case 53:
              if (!$g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean.$equals(updated.IsElement(), existing.IsElement()).$wrapped) {
                $current = 54;
                continue localasyncloop;
              } else {
                $current = 55;
                continue localasyncloop;
              }
              break;

            case 54:
              needsReplacement = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              $current = 6;
              continue localasyncloop;

            case 55:
              if (existing.IsElement().$wrapped && !$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals(updated.TagName().ToLowerCase(), existing.TagName().ToLowerCase()).$wrapped) {
                $current = 56;
                continue localasyncloop;
              } else {
                $current = 57;
                continue localasyncloop;
              }
              break;

            case 56:
              needsReplacement = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              $current = 6;
              continue localasyncloop;

            case 57:
              if (!existing.IsElement().$wrapped) {
                $current = 58;
                continue localasyncloop;
              } else {
                $current = 6;
                continue localasyncloop;
              }
              break;

            case 58:
              needsReplacement = $t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($t.syncnullcompare(updated.TextData(), function () {
                return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              }), $t.syncnullcompare(existing.TextData(), function () {
                return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              })).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              $current = 6;
              continue localasyncloop;

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
        $static.DIFF_REPLACE_NODE = $t.fastbox('replace-node', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        resolve();
      });
    }, '618ad33f', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_REMOVE_NODE = $t.fastbox('remove-node', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        resolve();
      });
    }, '99e18e2b', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_CREATE_NODE = $t.fastbox('create-node', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        resolve();
      });
    }, '49efda1b', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_SAME = $t.fastbox('same-node', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        resolve();
      });
    }, '4ccbe326', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.DIFF_THUNK = $t.fastbox('thunk', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        resolve();
      });
    }, '7bbf0b53', []);
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.nodeCounter = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        resolve();
      });
    }, '671f6fe5', []);
  });
  $module('pkg.github_com.serulian.virtualdom.HEAD.eventmanager', function () {
    var $static = this;
    this.$class('a4cc135e', 'EventManager', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (element) {
        var instance = new $static();
        instance.element = element;
        instance.registered = $g.pkg.github_com.serulian.corelib.HEAD.collections.Set($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty();
        instance.functionRefCounter = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        instance.handlers = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.corelib.HEAD.primitives.functionType($t.void)).Empty();
        instance.tree = $g.pkg.github_com.serulian.virtualdom.HEAD.eventmanager.eventTree.new();
        return instance;
      };
      $static.ForElement = function (element) {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.eventmanager.EventManager.new(element);
      };
      $instance.NodeRemoved = function (domNode) {
        var $this = this;
        var path;
        var split;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              if (!$t.fastbox(domNode, $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.NodeWrapper).IsElement().$wrapped) {
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
              path = $g.pkg.github_com.serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
              split = path.Split($t.fastbox('.', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                insertedCallback = virtualNode.DOMNodeInserted;
                if (insertedCallback != null) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 3;
                  continue localasyncloop;
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
                continue localasyncloop;

              case 3:
                eventHandlers = virtualNode.EventHandlers;
                if (eventHandlers != null) {
                  $current = 4;
                  continue localasyncloop;
                } else {
                  $current = 14;
                  continue localasyncloop;
                }
                break;

              case 4:
                if (eventHandlers.IsEmpty().$wrapped) {
                  $current = 5;
                  continue localasyncloop;
                } else {
                  $current = 6;
                  continue localasyncloop;
                }
                break;

              case 5:
                $resolve();
                return;

              case 6:
                path = $g.pkg.github_com.serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
                split = path.Split($t.fastbox('.', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                treeEntry = $this.tree.getOrAddBranch(split);
                treeEntry.clearHandlers();
                $current = 7;
                continue localasyncloop;

              case 7:
                $promise.maybe(eventHandlers.Keys()).then(function ($result0) {
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
                $temp1 = $result;
                $current = 9;
                continue localasyncloop;

              case 9:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 10;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 10:
                eventName = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 11;
                  continue localasyncloop;
                } else {
                  $current = 13;
                  continue localasyncloop;
                }
                break;

              case 11:
                $promise.maybe($this.register(eventName)).then(function ($result0) {
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
                handlerRef = eventHandlers.$index(eventName);
                treeEntry.addHandler(eventName, $t.assertnotnull(handlerRef));
                $current = 9;
                continue localasyncloop;

              case 13:
                $current = 14;
                continue localasyncloop;

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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                path = $g.pkg.github_com.serulian.virtualdom.HEAD.internal.getDOMPath(domNode);
                split = path.Split($t.fastbox('.', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                treeEntry = $this.tree.getOrAddBranch(split);
                treeEntry.clearHandlers();
                eventHandlers = virtualNode.EventHandlers;
                if (eventHandlers != null) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 9;
                  continue localasyncloop;
                }
                break;

              case 1:
                $current = 2;
                continue localasyncloop;

              case 2:
                $promise.maybe(eventHandlers.Keys()).then(function ($result0) {
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
                $temp1 = $result;
                $current = 4;
                continue localasyncloop;

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
                eventName = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 6;
                  continue localasyncloop;
                } else {
                  $current = 8;
                  continue localasyncloop;
                }
                break;

              case 6:
                $promise.maybe($this.register(eventName)).then(function ($result0) {
                  $result = $result0;
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 7:
                handlerRef = eventHandlers.$index(eventName);
                treeEntry.addHandler(eventName, $t.assertnotnull(handlerRef));
                $current = 4;
                continue localasyncloop;

              case 8:
                $current = 9;
                continue localasyncloop;

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
        $this.functionRefCounter = $t.fastbox($this.functionRefCounter.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
        return $t.box(ref, $g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference);
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                target = evt.target;
                if (target == null) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 2;
                  continue localasyncloop;
                }
                break;

              case 1:
                $resolve();
                return;

              case 2:
                path = $g.pkg.github_com.serulian.virtualdom.HEAD.internal.getDOMPath($t.assertnotnull(target));
                split = path.Split($t.fastbox('.', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                treeEntry = $this.tree.getBranch(split);
                if (treeEntry == null) {
                  $current = 3;
                  continue localasyncloop;
                } else {
                  $current = 4;
                  continue localasyncloop;
                }
                break;

              case 3:
                $resolve();
                return;

              case 4:
                handler = $t.assertnotnull(treeEntry).lookupHandler($t.fastbox(evt['type'], $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                if (handler != null) {
                  $current = 5;
                  continue localasyncloop;
                } else {
                  $current = 7;
                  continue localasyncloop;
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
                continue localasyncloop;

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
              handlerFunc = $this.handlers.$index($t.box(handler, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                if ($this.registered.Add(eventName).$wrapped) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 2;
                  continue localasyncloop;
                }
                break;

              case 1:
                $this.element.addEventListener(eventName.$wrapped, $t.markpromising(function (evt) {
                  var $result;
                  var $current = 0;
                  var $continue = function ($resolve, $reject) {
                    localasyncloop: while (true) {
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

                        case 1:
                          $resolve();
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
                continue localasyncloop;

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
          "ForElement|1|e429e0b7<a4cc135e>": true,
          "NodeRemoved|2|e429e0b7<void>": true,
          "NodeCreated|2|e429e0b7<void>": true,
          "NodeUpdated|2|e429e0b7<void>": true,
          "RegisterFunction|2|e429e0b7<c842d36c>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('52be322c', 'eventTree', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function () {
        var instance = new $static();
        instance.children = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.virtualdom.HEAD.eventmanager.eventTree).Empty();
        instance.handlers = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference).Empty();
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
              $this.children.RemoveKey(parts.$index($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)));
              return;

            case 2:
              child = $this.children.$index(parts.$index($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)));
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
              $t.assertnotnull(child).removeBranch(parts.$slice($t.fastbox(1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null));
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
              child = $this.children.$index(parts.$index($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)));
              if (child == null) {
                $current = 3;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 3:
              newBranch = $g.pkg.github_com.serulian.virtualdom.HEAD.eventmanager.eventTree.new();
              index = parts.$index($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
              $this.children.$setindex(index, newBranch);
              return newBranch.getOrAddBranch(parts.$slice($t.fastbox(1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null));

            case 4:
              return $t.assertnotnull(child).getOrAddBranch(parts.$slice($t.fastbox(1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null));

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
              child = $this.children.$index(parts.$index($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)));
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
              return $t.assertnotnull(child).getBranch(parts.$slice($t.fastbox(1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null));

            default:
              return;
          }
        }
      };
      $instance.clearHandlers = function () {
        var $this = this;
        $this.handlers = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference).Empty();
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
  $module('pkg.github_com.serulian.virtualdom.HEAD.internal', function () {
    var $static = this;
    $static.getDOMPath = function (node) {
      var existingPath;
      var $current = 0;
      syncloop: while (true) {
        switch ($current) {
          case 0:
            existingPath = node[$g.pkg.github_com.serulian.virtualdom.HEAD.internal.elementInternalPath.$wrapped];
            if (existingPath == null) {
              $current = 1;
              continue syncloop;
            } else {
              $current = 2;
              continue syncloop;
            }
            break;

          case 1:
            return $t.fastbox('(root)', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

          case 2:
            return $t.fastbox($t.cast(existingPath, $global.String, false), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

          default:
            return;
        }
      }
    };
    $static.setDOMPath = function (node, elementPath) {
      node[$g.pkg.github_com.serulian.virtualdom.HEAD.internal.elementInternalPath.$wrapped] = elementPath.$wrapped;
      return;
    };
    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.elementInternalPath = $t.fastbox("__internal_dom_path", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        resolve();
      });
    }, '1c1a7e08', []);
  });
  $module('pkg.github_com.serulian.virtualdom.HEAD.render', function () {
    var $static = this;
    $static.Render = $t.markpromising(function (renderable, context, node) {
      var $result;
      var diff;
      var rendered;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.renderable.RenderToVirtualNode(renderable, context)).then(function ($result0) {
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
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ComputeDiff(rendered, $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.NodeWrapper.For(node))).then(function ($result0) {
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
              $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.diff.ApplyDiff(diff, node, context.EventManager())).then(function ($result0) {
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
  $module('pkg.github_com.serulian.virtualdom.HEAD.renderable', function () {
    var $static = this;
    this.$class('0ccc604a', 'EmptyContext', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (em) {
        var instance = new $static();
        instance.em = em;
        return instance;
      };
      $static.WithEventManager = function (em) {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.EmptyContext.new(em);
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
          "WithEventManager|1|e429e0b7<0ccc604a>": true,
          "EventManager|3|a4cc135e": true,
          "Renderer|3|b4d369a3": true,
        };
        computed[("Get|2|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('db5086f1', 'renderableVirtualNode', false, '', function () {
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
              if ($this.props.$index($t.fastbox("Key", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)) != null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.cast($this.props.$index($t.fastbox("Key", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String, false);

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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($this.renderUnderRoot($this, $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), context)).then(function ($result0) {
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                attributes = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty();
                eventHandlers = $g.pkg.github_com.serulian.corelib.HEAD.collections.Map($g.pkg.github_com.serulian.corelib.HEAD.primitives.String, $g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference).Empty();
                key = null;
                nodeInsertedHandler = null;
                props = $this.props;
                children = $this.children;
                if (!props.IsEmpty().$wrapped) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 27;
                  continue localasyncloop;
                }
                break;

              case 1:
                if (props.$index($t.fastbox("Key", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)) != null) {
                  $current = 2;
                  continue localasyncloop;
                } else {
                  $current = 3;
                  continue localasyncloop;
                }
                break;

              case 2:
                key = $t.cast(props.$index($t.fastbox("Key", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String, false);
                $current = 3;
                continue localasyncloop;

              case 3:
                $current = 4;
                continue localasyncloop;

              case 4:
                $promise.maybe(props.Keys()).then(function ($result0) {
                  $result = $result0;
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 5:
                $temp1 = $result;
                $current = 6;
                continue localasyncloop;

              case 6:
                $promise.maybe($temp1.Next()).then(function ($result0) {
                  $temp0 = $result0;
                  $result = $temp0;
                  $current = 7;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 7:
                name = $temp0.First;
                if ($temp0.Second.$wrapped) {
                  $current = 8;
                  continue localasyncloop;
                } else {
                  $current = 26;
                  continue localasyncloop;
                }
                break;

              case 8:
                if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals(name, $t.fastbox("ondomnodeinserted", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) {
                  $current = 9;
                  continue localasyncloop;
                } else {
                  $current = 11;
                  continue localasyncloop;
                }
                break;

              case 9:
                fn = $t.cast(props.$index(name), $g.pkg.github_com.serulian.corelib.HEAD.primitives.functionType($t.void), false);
                nodeInsertedHandler = context.EventManager().RegisterFunction(fn);
                $current = 10;
                continue localasyncloop;

              case 10:
                $current = 6;
                continue localasyncloop;

              case 11:
                if (name.HasPrefix($t.fastbox("on", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) {
                  $current = 12;
                  continue localasyncloop;
                } else {
                  $current = 14;
                  continue localasyncloop;
                }
                break;

              case 12:
                fn = $t.cast(props.$index(name), $g.pkg.github_com.serulian.corelib.HEAD.primitives.functionType($t.void), false);
                eventHandlers.$setindex(name.$slice($t.fastbox(2, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null), context.EventManager().RegisterFunction(fn));
                $current = 13;
                continue localasyncloop;

              case 13:
                $current = 10;
                continue localasyncloop;

              case 14:
                if (!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals(name, $t.fastbox("Key", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) {
                  $current = 15;
                  continue localasyncloop;
                } else {
                  $current = 18;
                  continue localasyncloop;
                }
                break;

              case 15:
                if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals(name, $t.fastbox("className", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) {
                  $current = 16;
                  continue localasyncloop;
                } else {
                  $current = 19;
                  continue localasyncloop;
                }
                break;

              case 16:
                attributes.$setindex($t.fastbox('class', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.cast(props.$index(name), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String, false));
                $current = 17;
                continue localasyncloop;

              case 17:
                $current = 18;
                continue localasyncloop;

              case 18:
                $current = 13;
                continue localasyncloop;

              case 19:
                propValue = props.$index(name);
                if ($t.istype(propValue, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)) {
                  $current = 20;
                  continue localasyncloop;
                } else {
                  $current = 22;
                  continue localasyncloop;
                }
                break;

              case 20:
                attributes.$setindex(name, propValue);
                $current = 21;
                continue localasyncloop;

              case 21:
                $current = 17;
                continue localasyncloop;

              case 22:
                if ($t.istype(propValue, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)) {
                  $current = 23;
                  continue localasyncloop;
                } else {
                  $current = 24;
                  continue localasyncloop;
                }
                break;

              case 23:
                attributes.$setindex(name, name);
                $current = 21;
                continue localasyncloop;

              case 24:
                if (true) {
                  $current = 25;
                  continue localasyncloop;
                } else {
                  $current = 21;
                  continue localasyncloop;
                }
                break;

              case 25:
                $reject($g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError.WithMessage($t.fastbox('Unsupported attribute type', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)));
                return;

              case 26:
                $current = 27;
                continue localasyncloop;

              case 27:
                childList = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Empty();
                index = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
                $current = 28;
                continue localasyncloop;

              case 28:
                $temp3 = children;
                $current = 29;
                continue localasyncloop;

              case 29:
                $promise.maybe($temp3.Next()).then(function ($result0) {
                  $temp2 = $result0;
                  $result = $temp2;
                  $current = 30;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 30:
                child = $temp2.First;
                if ($temp2.Second.$wrapped) {
                  $current = 31;
                  continue localasyncloop;
                } else {
                  $current = 52;
                  continue localasyncloop;
                }
                break;

              case 31:
                index = $t.fastbox(index.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
                if (child == null) {
                  $current = 32;
                  continue localasyncloop;
                } else {
                  $current = 33;
                  continue localasyncloop;
                }
                break;

              case 32:
                $current = 29;
                continue localasyncloop;

              case 33:
                typedChild = child;
                if ($t.istype(typedChild, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)) {
                  $current = 34;
                  continue localasyncloop;
                } else {
                  $current = 36;
                  continue localasyncloop;
                }
                break;

              case 34:
                childList.Add(($temp4 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp4.Text = typedChild, $temp4));
                $current = 35;
                continue localasyncloop;

              case 35:
                $current = 29;
                continue localasyncloop;

              case 36:
                if ($t.istype(typedChild, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode)) {
                  $current = 37;
                  continue localasyncloop;
                } else {
                  $current = 38;
                  continue localasyncloop;
                }
                break;

              case 37:
                childList.Add(typedChild);
                $current = 35;
                continue localasyncloop;

              case 38:
                if ($t.istype(typedChild, $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode)) {
                  $current = 39;
                  continue localasyncloop;
                } else {
                  $current = 41;
                  continue localasyncloop;
                }
                break;

              case 39:
                currentPathUnderRoot = $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("[", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("]", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([pathUnderRoot, index]));
                $promise.maybe(typedChild.renderUnderRoot(root, currentPathUnderRoot, context)).then(function ($result0) {
                  $result = $result0;
                  $current = 40;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 40:
                cn = $result;
                childList.Add(cn);
                $current = 35;
                continue localasyncloop;

              case 41:
                if ($t.istype(typedChild, $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.Renderable)) {
                  $current = 42;
                  continue localasyncloop;
                } else {
                  $current = 48;
                  continue localasyncloop;
                }
                break;

              case 42:
                renderer = context.Renderer();
                if (renderer != null) {
                  $current = 43;
                  continue localasyncloop;
                } else {
                  $current = 46;
                  continue localasyncloop;
                }
                break;

              case 43:
                currentPathUnderRoot = $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("[", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("]", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([pathUnderRoot, index]));
                $promise.maybe(renderer.Render(typedChild, root, currentPathUnderRoot, context)).then(function ($result0) {
                  $result = childList.Add($result0);
                  $current = 44;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 44:
                $current = 45;
                continue localasyncloop;

              case 45:
                $current = 35;
                continue localasyncloop;

              case 46:
                $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.renderable.RenderToVirtualNode(typedChild, context)).then(function ($result0) {
                  $result = childList.Add($result0);
                  $current = 47;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 47:
                $current = 45;
                continue localasyncloop;

              case 48:
                if ($t.istype(typedChild, $g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable)) {
                  $current = 49;
                  continue localasyncloop;
                } else {
                  $current = 50;
                  continue localasyncloop;
                }
                break;

              case 49:
                childList.Add(($temp5 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp5.Text = typedChild.String(), $temp5));
                $current = 35;
                continue localasyncloop;

              case 50:
                if (true) {
                  $current = 51;
                  continue localasyncloop;
                } else {
                  $current = 35;
                  continue localasyncloop;
                }
                break;

              case 51:
                $reject($g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError.WithMessage($t.fastbox('Unsupported instance under VirtualNode. Did you forget to add a Render() method to a class?', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)));
                return;

              case 52:
                $promise.maybe(eventHandlers.Mapping()).then(function ($result0) {
                  return $promise.maybe(attributes.Mapping()).then(function ($result1) {
                    $result = ($temp6 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp6.TagName = $this.tagName, $temp6.EventHandlers = $result0, $temp6.Attributes = $result1, $temp6.Children = childList.$slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null), $temp6.DOMNodeInserted = nodeInsertedHandler, $temp6.Key = key, $temp6);
                    $current = 53;
                    $continue($resolve, $reject);
                    return;
                  });
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 53:
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
          "RenderKey|3|4b279881": true,
          "Render|2|e429e0b7<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('d93bbaaa', 'RenderKeyed', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "RenderKey|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('8f7f0394', 'Context', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Renderer|3|b4d369a3": true,
          "EventManager|3|a4cc135e": true,
        };
        computed[("Get|2|e429e0b7<" + $t.typeid(T)) + ">"] = true;
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('b4d369a3', 'Renderer', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|e429e0b7<141b3b08>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('989c5c12', 'Renderable', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Render|2|e429e0b7<any>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.RenderToVirtualNode = $t.markpromising(function (instance, context) {
      var $result;
      var $temp0;
      var $temp1;
      var $temp2;
      var $temp3;
      var current;
      var err;
      var index;
      var keyed;
      var rootParent;
      var typedValue;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              current = instance;
              rootParent = null;
              index = $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              $current = 1;
              continue localasyncloop;

            case 1:
              if (true) {
                $current = 2;
                continue localasyncloop;
              } else {
                $current = 22;
                continue localasyncloop;
              }
              break;

            case 2:
              if (current == null) {
                $current = 3;
                continue localasyncloop;
              } else {
                $current = 4;
                continue localasyncloop;
              }
              break;

            case 3:
              $resolve(($temp0 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Text = $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0));
              return;

            case 4:
              typedValue = current;
              if ($t.istype(typedValue, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode)) {
                $current = 5;
                continue localasyncloop;
              } else {
                $current = 9;
                continue localasyncloop;
              }
              break;

            case 5:
              try {
                var $expr = $t.cast(instance, $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.RenderKeyed, false);
                keyed = $expr;
                err = null;
              } catch ($rejected) {
                err = $t.ensureerror($rejected);
                keyed = null;
              }
              $current = 6;
              continue localasyncloop;

            case 6:
              if (keyed != null) {
                $current = 7;
                continue localasyncloop;
              } else {
                $current = 8;
                continue localasyncloop;
              }
              break;

            case 7:
              $resolve(($temp1 = typedValue.Clone(), $temp1.Key = keyed.RenderKey(), $temp1));
              return;

            case 8:
              $resolve(typedValue);
              return;

            case 9:
              if ($t.istype(typedValue, $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode)) {
                $current = 10;
                continue localasyncloop;
              } else {
                $current = 13;
                continue localasyncloop;
              }
              break;

            case 10:
              $promise.maybe(typedValue.renderUnderRoot($t.syncnullcompare(rootParent, function () {
                return typedValue;
              }), $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), context)).then(function ($result0) {
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
              continue localasyncloop;

            case 12:
              index = $t.fastbox(index.$wrapped + 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              $current = 1;
              continue localasyncloop;

            case 13:
              if ($t.istype(typedValue, $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.Renderable)) {
                $current = 14;
                continue localasyncloop;
              } else {
                $current = 18;
                continue localasyncloop;
              }
              break;

            case 14:
              if (index.$wrapped == 0) {
                $current = 15;
                continue localasyncloop;
              } else {
                $current = 16;
                continue localasyncloop;
              }
              break;

            case 15:
              rootParent = typedValue;
              $current = 16;
              continue localasyncloop;

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
              continue localasyncloop;

            case 18:
              if ($t.istype(typedValue, $g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable)) {
                $current = 19;
                continue localasyncloop;
              } else {
                $current = 20;
                continue localasyncloop;
              }
              break;

            case 19:
              $resolve(($temp2 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp2.Text = typedValue.String(), $temp2));
              return;

            case 20:
              if (true) {
                $current = 21;
                continue localasyncloop;
              } else {
                $current = 12;
                continue localasyncloop;
              }
              break;

            case 21:
              $reject($g.pkg.github_com.serulian.corelib.HEAD.helpertypes.SimpleError.WithMessage($t.fastbox('Unsupported value under Render. Did you forget to add a Render method?', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)));
              return;

            case 22:
              $resolve(($temp3 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp3.Text = $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp3));
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
              var $expr = $t.cast(anyChild, $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.RenderKeyed, false);
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
            return $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(".", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([parentPath, key]));

          case 4:
            $current = 5;
            continue syncloop;

          case 5:
            return $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("[", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("]", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([parentPath, childIndex]));

          default:
            return;
        }
      }
    };
  });
  $module('pkg.github_com.serulian.virtualdom.HEAD.style', function () {
    var $static = this;
    this.$struct('7e99579e', 'stylesheetProps', false, '', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<7e99579e>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<7e99579e>": true,
          "String|2|e429e0b7<4b279881>": true,
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
          return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        });
      });
      return ($temp1 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp1.TagName = $t.fastbox('style', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp1.Attributes = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overObject((function () {
        var obj = {
        };
        obj["type"] = $t.fastbox("text/css", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        return obj;
      })()), $temp1.Children = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).overArray([($temp0 = $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode.new(), $temp0.Text = cssContents, $temp0)]), $temp1);
    };
  });
  $module('pkg.github_com.serulian.virtualdom.HEAD.types', function () {
    var $static = this;
    this.$type('c842d36c', 'FunctionReference', false, '', function () {
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

    this.$struct('141b3b08', 'VirtualNode', false, '', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      $t.defineStructField($static, 'Attributes', 'Attributes', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      }, true);
      $t.defineStructField($static, 'Key', 'Key', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      $t.defineStructField($static, 'Text', 'Text', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      $t.defineStructField($static, 'Children', 'Children', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode);
      }, true);
      $t.defineStructField($static, 'EventHandlers', 'EventHandlers', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference);
      }, true);
      $t.defineStructField($static, 'DOMNodeInserted', 'DOMNodeInserted', function () {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.types.FunctionReference;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<141b3b08>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<141b3b08>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

  });
  $module('pkg.github_com.serulian.virtualdom.HEAD.vdom', function () {
    var $static = this;
    $static.A = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('a', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Span = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('span', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Div = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('div', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Img = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('img', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Select = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('select', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Option = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('option', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Style = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('style', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Button = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('button', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.TextArea = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('textarea', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.IFrame = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('iframe', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Pre = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('pre', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Nav = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('nav', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Ul = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('ul', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Li = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('li', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
    $static.Input = function (props, childStream) {
      return $g.pkg.github_com.serulian.virtualdom.HEAD.renderable.renderableVirtualNode.new($t.fastbox('input', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), props, childStream);
    };
  });
  $module('pkg.github_com.serulian.virtualdom.HEAD.wrappers', function () {
    var $static = this;
    this.$class('71a7c622', 'DOMError', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (message) {
        var instance = new $static();
        instance.message = message;
        return instance;
      };
      $static.WithMessage = function (message) {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.DOMError.new(message);
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
          "WithMessage|1|e429e0b7<71a7c622>": true,
          "Message|3|4b279881": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$interface('ad5543d4', 'DOMNode', false, '', function () {
      var $static = this;
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "IsElement|3|8e6a0ed7": true,
          "TagName|3|4b279881": true,
          "Key|3|4b279881": true,
          "TextData|3|4b279881": true,
          "AttributeNames|3|8db223c3<4b279881>": true,
          "ChildCount|3|800df61b": true,
          "GetChild|2|e429e0b7<ad5543d4>": true,
          "GetAttribute|2|e429e0b7<4b279881>": true,
          "Virtual|3|141b3b08": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('6bfdcd21', 'NodeWrapper', false, '', function () {
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
        return $t.fastbox(node, $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.NodeWrapper);
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                if (!$this.IsElement().$wrapped) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 2;
                  continue localasyncloop;
                }
                break;

              case 1:
                $resolve($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty());
                return;

              case 2:
                attributes = $this.$wrapped.attributes;
                names = $g.pkg.github_com.serulian.corelib.HEAD.collections.List($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty();
                $current = 3;
                continue localasyncloop;

              case 3:
                $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($t.any).ForArray(attributes).Stream();
                $current = 4;
                continue localasyncloop;

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
                  continue localasyncloop;
                } else {
                  $current = 7;
                  continue localasyncloop;
                }
                break;

              case 6:
                names.Add($t.fastbox($t.cast($t.dynamicaccess(attr, 'name', false), $global.String, false), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                $current = 4;
                continue localasyncloop;

              case 7:
                $resolve(names.$slice($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), null));
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
        return $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.keyAttachment.$index($this.$wrapped);
      });
      $instance.IsElement = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.nodeType == 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
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
              return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

            case 2:
              return $t.fastbox($this.$wrapped.tagName, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String).ToLowerCase();

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
              return $t.fastbox($this.$wrapped.wholeText, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

            default:
              return;
          }
        }
      });
      $instance.ChildCount = $t.property(function () {
        var $this = this;
        return $t.fastbox($this.$wrapped.childNodes.length, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
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
              throw $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Invalid child index', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

            case 2:
              return $t.fastbox($t.assertnotnull(child), $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.NodeWrapper);

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
              throw $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Cannot retrieve attribute for non-element', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

            case 2:
              return $t.fastbox($this.$wrapped.getAttribute(name.$wrapped), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);

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
          "For|1|e429e0b7<6bfdcd21>": true,
          "AttributeNames|3|8db223c3<4b279881>": true,
          "Key|3|4b279881": true,
          "IsElement|3|8e6a0ed7": true,
          "TagName|3|4b279881": true,
          "TextData|3|4b279881": true,
          "ChildCount|3|800df61b": true,
          "Virtual|3|141b3b08": true,
          "GetChild|2|e429e0b7<ad5543d4>": true,
          "GetAttribute|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$type('ae722486', 'VirtualNodeWrapper', false, '', function () {
      var $instance = this.prototype;
      var $static = this;
      this.$box = function ($wrapped) {
        var instance = new this();
        instance[BOXED_DATA_PROPERTY] = $wrapped;
        return instance;
      };
      this.$roottype = function () {
        return $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode;
      };
      $static.For = function (node) {
        return $t.box(node, $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper);
      };
      $instance.Virtual = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode);
      });
      $instance.Key = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Key;
      });
      $instance.AttributeNames = $t.property($t.markpromising(function () {
        var $this = this;
        var $result;
        var attrs;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                attrs = $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Attributes;
                if (attrs == null) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 2;
                  continue localasyncloop;
                }
                break;

              case 1:
                $resolve($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty());
                return;

              case 2:
                $promise.maybe(attrs.Keys()).then(function ($result1) {
                  return $promise.maybe($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).From($result1)).then(function ($result0) {
                    $result = $result0;
                    $current = 3;
                    $continue($resolve, $reject);
                    return;
                  });
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
      }));
      $instance.IsElement = $t.property(function () {
        var $this = this;
        return $t.fastbox(!($t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).TagName == null), $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
      });
      $instance.TagName = $t.property(function () {
        var $this = this;
        return $t.syncnullcompare($t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).TagName, function () {
          return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        });
      });
      $instance.ChildCount = $t.property(function () {
        var $this = this;
        var children;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              children = $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Children;
              if (children == null) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 2;
                continue syncloop;
              }
              break;

            case 1:
              return $t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);

            case 2:
              return children.Length();

            default:
              return;
          }
        }
      });
      $instance.TextData = $t.property(function () {
        var $this = this;
        return $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Text;
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
              throw $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Invalid child index', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

            case 2:
              children = $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Children;
              return $t.box($t.assertnotnull(children).$index(index), $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.VirtualNodeWrapper);

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
              throw $g.pkg.github_com.serulian.virtualdom.HEAD.wrappers.DOMError.new($t.fastbox('Cannot retrieve attribute for non-element', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));

            case 2:
              attributes = $t.box($this, $g.pkg.github_com.serulian.virtualdom.HEAD.types.VirtualNode).Attributes;
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
          "For|1|e429e0b7<ae722486>": true,
          "Virtual|3|141b3b08": true,
          "Key|3|4b279881": true,
          "AttributeNames|3|8db223c3<4b279881>": true,
          "IsElement|3|8e6a0ed7": true,
          "TagName|3|4b279881": true,
          "ChildCount|3|800df61b": true,
          "TextData|3|4b279881": true,
          "GetChild|2|e429e0b7<ad5543d4>": true,
          "GetAttribute|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$init(function () {
      return $promise.new(function (resolve) {
        $static.keyAttachment = $g.pkg.github_com.serulian.attachment.HEAD.attachment.Attachment($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Unique($t.fastbox('vdom-key', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
        resolve();
      });
    }, 'bef82030', ['e9c3608f']);
  });
  $module('playground', function () {
    var $static = this;
    this.$class('15c9d480', 'PlaygroundApp', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (playgroundBase) {
        var instance = new $static();
        instance.playgroundBase = playgroundBase;
        instance.playgroundBase.$principal = instance;
        return instance;
      };
      $static.Declare = $t.markpromising(function (props) {
        var app;
        var initialCode;
        var initialGistId;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                initialGistId = props.InitialGistId;
                initialCode = $t.fastbox("from \"github.com/serulian/debuglib\" import Log\n\nfunction Run() any {\n\t// Note: open the browser console to see Log outputs.\n\tLog('hello world!')\n\treturn true\n}", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                app = $g.playground.PlaygroundApp.new($g.playground.playgroundBase.new($g.playground.playgroundState.new(initialGistId != null ? $t.fastbox('loadinggist', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String) : $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), initialCode, $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                if (initialGistId != null) {
                  $current = 1;
                  continue localasyncloop;
                } else {
                  $current = 2;
                  continue localasyncloop;
                }
                break;

              case 1:
                $global.setTimeout($t.markpromising(function () {
                  var $result;
                  var $current = 0;
                  var $continue = function ($resolve, $reject) {
                    localasyncloop: while (true) {
                      switch ($current) {
                        case 0:
                          $promise.maybe(app.loadGist(initialGistId)).then(function ($result0) {
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
                          $resolve();
                          return;

                        default:
                          $resolve();
                          return;
                      }
                    }
                  };
                  return $promise.new($continue);
                }), 50);
                $current = 2;
                continue localasyncloop;

              case 2:
                $resolve(app);
                return;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
      $instance.loadGist = $t.markpromising(function (initialGistId) {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var err;
        var gistText;
        var info;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.GetURLContents($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("https://api.github.com/gists/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([initialGistId])))).then(function ($result0) {
                  gistText = $result0;
                  err = null;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                }).catch(function ($rejected) {
                  err = $t.ensureerror($rejected);
                  gistText = null;
                  $current = 1;
                  $continue($resolve, $reject);
                  return;
                });
                return;

              case 1:
                if (gistText != null) {
                  $current = 2;
                  continue localasyncloop;
                } else {
                  $current = 5;
                  continue localasyncloop;
                }
                break;

              case 2:
                $promise.maybe($g.playground.gistInfo.Parse($g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON)(gistText)).then(function ($result0) {
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
                info = $result;
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.gistInfo = info, $temp0.initialCode = $t.syncnullcompare($t.dynamicaccess(info.files.$index($t.fastbox('entrypoint.seru', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)), 'content', false), function () {
                  return $this.state.initialCode;
                }), $temp0.stateId = $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
                $resolve();
                return;

              case 5:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this, ($temp1 = $this.state.Clone(), $temp1.stateId = $t.fastbox('couldnotloadgist', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp1))).then(function ($result0) {
                  $result = $result0;
                  $current = 6;
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
      $instance.dismissModal = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.stateId = $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
      $instance.Render = function (context) {
        var $this = this;
        return $g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
          id: $t.fastbox("rootElement", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
        }), (function () {
          var $current = 0;
          var $continue = function ($yield, $yieldin, $reject, $done) {
            while (true) {
              switch ($current) {
                case 0:
                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                    className: $t.fastbox("modal-overlay", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                  }), (function () {
                    var $current = 0;
                    var $continue = function ($yield, $yieldin, $reject, $done) {
                      while (true) {
                        switch ($current) {
                          case 0:
                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("model-content", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                            }), (function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("spinner", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), $generator.directempty()));
                                      $current = 1;
                                      return;

                                    case 1:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("model-overlay-message", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($t.fastbox("\n\t\t\t\t\t\tPlease wait while we load the gist for this playground\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $done();
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()));
                                      $current = 2;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            })()));
                            $current = 1;
                            return;

                          case 1:
                            $done();
                            return;

                          default:
                            $done();
                            return;
                        }
                      }
                    };
                    return $generator.new($continue, false);
                  })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('loadinggist', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                  $current = 1;
                  return;

                case 1:
                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                    className: $t.fastbox("modal-overlay", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                  }), (function () {
                    var $current = 0;
                    var $continue = function ($yield, $yieldin, $reject, $done) {
                      while (true) {
                        switch ($current) {
                          case 0:
                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("model-content", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                            }), (function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("model-overlay-message", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($t.fastbox("\n\t\t\t\t\t\tAn error occurred while trying to share this playground\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $done();
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('couldnotshare', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                      $current = 1;
                                      return;

                                    case 1:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("model-overlay-message", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($t.fastbox("\n\t\t\t\t\t\tAn error occurred while trying to build this playground\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $done();
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('servererror', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                      $current = 2;
                                      return;

                                    case 2:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("model-overlay-message", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($t.fastbox("\n\t\t\t\t\t\tAn error occurred while trying to load the gist for this playground\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $done();
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('couldnotloadgist', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                      $current = 3;
                                      return;

                                    case 3:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("model-overlay-dismiss", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Button($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("btn btn-primary btn-large", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                  onclick: $t.dynamicaccess($this, 'dismissModal', false),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($t.fastbox("OKAY", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $done();
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $done();
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()));
                                      $current = 4;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            })()));
                            $current = 1;
                            return;

                          case 1:
                            $done();
                            return;

                          default:
                            $done();
                            return;
                        }
                      }
                    };
                    return $generator.new($continue, false);
                  })()), $t.fastbox(($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('couldnotshare', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped || $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('servererror', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) || $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('couldnotloadgist', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                  $current = 2;
                  return;

                case 2:
                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).Empty(), (function () {
                    var $current = 0;
                    var $continue = function ($yield, $yieldin, $reject, $done) {
                      while (true) {
                        switch ($current) {
                          case 0:
                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Nav($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("navbar navbar-default", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                            }), (function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.A($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("navbar-brand", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                        href: $t.fastbox("#", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Img($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("logo", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                  src: $t.fastbox("serulian.png", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), $generator.directempty()));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Span($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("title", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($t.fastbox("Serulian Playground", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $done();
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()));
                                                $current = 2;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()));
                                      $current = 1;
                                      return;

                                    case 1:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("navbar-form navbar-left", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $result;
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.DynamicAttributes($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Button($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("btn btn-primary", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                  onclick: $t.dynamicaccess($this, 'runProject', false),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($t.fastbox("\n\t\t\t\t\t\t\tRun\n\t\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $done();
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()), $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).overObject((function () {
                                                  var obj = {
                                                  };
                                                  obj['disabled'] = $this.state.currentCode.IsEmpty();
                                                  return obj;
                                                })()))).then(function ($result0) {
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
                                                $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.DynamicAttributes($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Button($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("btn btn-default", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                  onclick: $t.dynamicaccess($this, 'shareProject', false),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($t.fastbox("\n\t\t\t\t\t\t\tShare (Public)\n\t\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $done();
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()), $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean).overObject((function () {
                                                  var obj = {
                                                  };
                                                  obj['disabled'] = $this.state.currentCode.IsEmpty();
                                                  return obj;
                                                })()))).then(function ($result0) {
                                                  $result = $g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($result0, $t.fastbox($this.state.gistInfo == null, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean));
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
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Span($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("shared", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Button($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("btn", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                            disabled: $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($t.fastbox("Shared", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Span($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("shared-url url", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Input($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                                      className: $t.fastbox("form-control", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                                      readonly: $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean),
                                                                      type: $t.fastbox("text", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                                      value: $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($t.fastbox('http://serulian.io/p/', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.syncnullcompare($t.dynamicaccess($this.state.gistInfo, 'id', false), function () {
                                                                        return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                                                                      })),
                                                                    }), $generator.directempty()));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 2;
                                                          return;

                                                        case 2:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Span($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("shared-url gist", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Input($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                                      className: $t.fastbox("form-control", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                                      readonly: $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean),
                                                                      type: $t.fastbox("text", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                                      value: $t.dynamicaccess($this.state.gistInfo, 'html_url', false),
                                                                    }), $generator.directempty()));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 3;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()), $t.fastbox($this.state.gistInfo != null, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                                $current = 5;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, true);
                                      })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                      $current = 2;
                                      return;

                                    case 2:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("navbar-form navbar-left", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("spinner", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), $generator.directempty()));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $done();
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()), $t.fastbox($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('building', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped || $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('sharing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                      $current = 3;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            })()));
                            $current = 1;
                            return;

                          case 1:
                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                              className: $t.fastbox("editor-and-viewer", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                            }), (function () {
                              var $current = 0;
                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                while (true) {
                                  switch ($current) {
                                    case 0:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("left-col", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("code-editor-row", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("section-title", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($t.fastbox("Serulian", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            style: $t.fastbox("height: 100%;", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $temp0;
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($g.codeeditor.CodeEditor.Declare(($temp0 = $g.codeeditor.codeEditorProps.new($t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)), $temp0.Theme = $t.fastbox("chrome", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0.OnChanged = $t.dynamicaccess($this, 'codeChanged', false), $temp0.Mode = $g.serulianmode.buildSerulianAceMode(), $temp0), $this.state.initialCode));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()), $t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('loadinggist', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                                          $current = 2;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("output-row", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("section-title", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($t.fastbox("Build Output", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("build-result", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($t.dynamicaccess($this.state.buildResult, 'Output', false));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'Output', false), 'IsEmpty', false), function () {
                                                            return $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                                                          }).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                                          $current = 2;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()));
                                                $current = 2;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()));
                                      $current = 1;
                                      return;

                                    case 1:
                                      $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                        className: $t.fastbox("right-col", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                      }), (function () {
                                        var $current = 0;
                                        var $continue = function ($yield, $yieldin, $reject, $done) {
                                          while (true) {
                                            switch ($current) {
                                              case 0:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("iframe-row", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), (function () {
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("section-title", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($t.fastbox("Running Application", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("enter-code", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Span($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                                      className: $t.fastbox("glyphicon glyphicon-arrow-left", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                                    }), $generator.directempty()));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $yield($t.fastbox(" Enter code and hit \"Run\"\n\t\t\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 2;
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()), $t.fastbox($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false) == null, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)), $t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('building', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                                          $current = 2;
                                                          return;

                                                        case 2:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            class: $t.fastbox("building", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Span($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                                      className: $t.fastbox("glyphicon glyphicon-refresh", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                                    }), $generator.directempty()));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $yield($t.fastbox("\n\t\t\t\t\t\t\t\tBuilding\n\t\t\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 2;
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('building', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                                          $current = 3;
                                                          return;

                                                        case 3:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.IFrame($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            frameborder: $t.fastbox("0", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                            ondomnodeinserted: $t.dynamicaccess($this, 'emitCode', false),
                                                            sandbox: $t.fastbox("allow-forms allow-popups allow-scripts allow-same-origin allow-modals", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), $generator.directempty()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), 'IsEmpty', false), function () {
                                                            return $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                                                          }).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                                          $current = 4;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, false);
                                                })()));
                                                $current = 1;
                                                return;

                                              case 1:
                                                $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                  className: $t.fastbox("console-row", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                }), (function () {
                                                  var $result;
                                                  var $current = 0;
                                                  var $continue = function ($yield, $yieldin, $reject, $done) {
                                                    while (true) {
                                                      switch ($current) {
                                                        case 0:
                                                          $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("section-title", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($t.fastbox("Console Output", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()));
                                                          $current = 1;
                                                          return;

                                                        case 1:
                                                          $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                                            className: $t.fastbox("console-output", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                                          }), (function () {
                                                            var $current = 0;
                                                            var $continue = function ($yield, $yieldin, $reject, $done) {
                                                              while (true) {
                                                                switch ($current) {
                                                                  case 0:
                                                                    $yield($this.state.consoleOutput);
                                                                    $current = 1;
                                                                    return;

                                                                  case 1:
                                                                    $done();
                                                                    return;

                                                                  default:
                                                                    $done();
                                                                    return;
                                                                }
                                                              }
                                                            };
                                                            return $generator.new($continue, false);
                                                          })()), $this.state.consoleOutput.IsEmpty())).then(function ($result0) {
                                                            $result = $result0;
                                                            $current = 2;
                                                            $continue($yield, $yieldin, $reject, $done);
                                                            return;
                                                          }).catch(function (err) {
                                                            throw err;
                                                          });
                                                          return;

                                                        case 2:
                                                          $yield($result);
                                                          $current = 3;
                                                          return;

                                                        default:
                                                          $done();
                                                          return;
                                                      }
                                                    }
                                                  };
                                                  return $generator.new($continue, true);
                                                })()));
                                                $current = 2;
                                                return;

                                              default:
                                                $done();
                                                return;
                                            }
                                          }
                                        };
                                        return $generator.new($continue, false);
                                      })()));
                                      $current = 2;
                                      return;

                                    default:
                                      $done();
                                      return;
                                  }
                                }
                              };
                              return $generator.new($continue, false);
                            })()));
                            $current = 2;
                            return;

                          default:
                            $done();
                            return;
                        }
                      }
                    };
                    return $generator.new($continue, false);
                  })()));
                  $current = 3;
                  return;

                default:
                  $done();
                  return;
              }
            }
          };
          return $generator.new($continue, false);
        })());
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
          return this.playgroundBase.StateUpdated.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'shareProject', {
        get: function () {
          return this.playgroundBase.shareProject.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'runProject', {
        get: function () {
          return this.playgroundBase.runProject.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'codeChanged', {
        get: function () {
          return this.playgroundBase.codeChanged.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'updateConsole', {
        get: function () {
          return this.playgroundBase.updateConsole.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'registerConsoleUpdater', {
        get: function () {
          return this.playgroundBase.registerConsoleUpdater.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'emitCode', {
        get: function () {
          return this.playgroundBase.emitCode.bind(this.playgroundBase);
        },
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Declare|1|e429e0b7<15c9d480>": true,
          "Render|2|e429e0b7<any>": true,
          "StateUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$class('5cba1fe7', 'PlaygroundEditor', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (playgroundBase) {
        var instance = new $static();
        instance.playgroundBase = playgroundBase;
        instance.playgroundBase.$principal = instance;
        return instance;
      };
      $static.Declare = function (attributes, code) {
        return $g.playground.PlaygroundEditor.new($g.playground.playgroundBase.new($g.playground.playgroundState.new($t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), code, code, $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
      };
      $instance.showEditTab = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentView = $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
      $instance.showOutputTab = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentView = $t.fastbox('output', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
      $instance.showFrameTab = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this, ($temp0 = $this.state.Clone(), $temp0.currentView = $t.fastbox('frame', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
      $instance.Render = function (context) {
        var $this = this;
        var height;
        var heightPx;
        var lineCount;
        var $current = 0;
        syncloop: while (true) {
          switch ($current) {
            case 0:
              height = $t.fastbox('auto', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              if (!$this.state.initialCode.IsEmpty().$wrapped) {
                $current = 1;
                continue syncloop;
              } else {
                $current = 4;
                continue syncloop;
              }
              break;

            case 1:
              lineCount = $this.state.initialCode.Split($t.fastbox('\n', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).Length();
              heightPx = $t.fastbox((lineCount.$wrapped * 16) + 50, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              if (heightPx.$wrapped > 1000) {
                $current = 2;
                continue syncloop;
              } else {
                $current = 3;
                continue syncloop;
              }
              break;

            case 2:
              heightPx = $t.fastbox(1000, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer);
              $current = 3;
              continue syncloop;

            case 3:
              height = $g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("px", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([heightPx]));
              $current = 4;
              continue syncloop;

            case 4:
              return $g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                className: $t.fastbox("playgroundEditor", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                style: $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($t.fastbox('height: ', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), height),
              }), (function () {
                var $result;
                var $current = 0;
                var $continue = function ($yield, $yieldin, $reject, $done) {
                  while (true) {
                    switch ($current) {
                      case 0:
                        $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("pane", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                        }), (function () {
                          var $temp0;
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $yield($g.codeeditor.CodeEditor.Declare(($temp0 = $g.codeeditor.codeEditorProps.new($t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)), $temp0.Mode = $g.serulianmode.buildSerulianAceMode(), $temp0.OnChanged = $t.dynamicaccess($this, 'codeChanged', false), $temp0.Theme = $t.fastbox("chrome", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0), $this.state.currentCode.Trim()));
                                  $current = 1;
                                  return;

                                case 1:
                                  $done();
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, false);
                        })()), $t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.currentView, $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean))).then(function ($result0) {
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
                        $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("pane", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                        }), (function () {
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("build-result", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                  }), (function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($t.dynamicaccess($this.state.buildResult, 'Output', false));
                                            $current = 1;
                                            return;

                                          case 1:
                                            $done();
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  })()), $t.fastbox($this.state.buildResult != null, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                  $current = 1;
                                  return;

                                case 1:
                                  $done();
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, false);
                        })()), $t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.currentView, $t.fastbox('output', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean))).then(function ($result0) {
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
                        $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("pane", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                        }), (function () {
                          var $result;
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $promise.maybe($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.HideIf($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Pre($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("console-output", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                  }), (function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($this.state.consoleOutput);
                                            $current = 1;
                                            return;

                                          case 1:
                                            $done();
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  })()), $this.state.consoleOutput.IsEmpty())).then(function ($result0) {
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
                                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.IFrame($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    frameborder: $t.fastbox("0", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                    ondomnodeinserted: $t.dynamicaccess($this, 'emitCode', false),
                                    sandbox: $t.fastbox("allow-forms allow-popups allow-scripts allow-same-origin allow-modals", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                  }), $generator.directempty()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), 'IsEmpty', false), function () {
                                    return $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                                  }).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                  $current = 3;
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, true);
                        })()), $t.fastbox(!$g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.currentView, $t.fastbox('frame', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean))).then(function ($result0) {
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
                        $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                          className: $t.fastbox("toolbar", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                        }), (function () {
                          var $current = 0;
                          var $continue = function ($yield, $yieldin, $reject, $done) {
                            while (true) {
                              switch ($current) {
                                case 0:
                                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Ul($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("tabs", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                  }), (function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Li($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                              className: $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.currentView, $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped ? $t.fastbox('active', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String) : $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                              onclick: $t.dynamicaccess($this, 'showEditTab', false),
                                            }), (function () {
                                              var $current = 0;
                                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                                while (true) {
                                                  switch ($current) {
                                                    case 0:
                                                      $yield($t.fastbox("\n\t\t\t\t\t\tCode\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                      $current = 1;
                                                      return;

                                                    case 1:
                                                      $done();
                                                      return;

                                                    default:
                                                      $done();
                                                      return;
                                                  }
                                                }
                                              };
                                              return $generator.new($continue, false);
                                            })()));
                                            $current = 1;
                                            return;

                                          case 1:
                                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Li($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                              className: $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.currentView, $t.fastbox('output', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped ? $t.fastbox('active', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String) : $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                              onclick: $t.dynamicaccess($this, 'showOutputTab', false),
                                            }), (function () {
                                              var $current = 0;
                                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                                while (true) {
                                                  switch ($current) {
                                                    case 0:
                                                      $yield($t.fastbox("\n\t\t\t\t\t\tOutput\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                      $current = 1;
                                                      return;

                                                    case 1:
                                                      $done();
                                                      return;

                                                    default:
                                                      $done();
                                                      return;
                                                  }
                                                }
                                              };
                                              return $generator.new($continue, false);
                                            })()), $t.fastbox($this.state.buildResult != null, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                            $current = 2;
                                            return;

                                          case 2:
                                            $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Li($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                              className: $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.currentView, $t.fastbox('frame', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped ? $t.fastbox('active', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String) : $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                              onclick: $t.dynamicaccess($this, 'showFrameTab', false),
                                            }), (function () {
                                              var $current = 0;
                                              var $continue = function ($yield, $yieldin, $reject, $done) {
                                                while (true) {
                                                  switch ($current) {
                                                    case 0:
                                                      $yield($t.fastbox("\n\t\t\t\t\t\tCompiled\n\t\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                                      $current = 1;
                                                      return;

                                                    case 1:
                                                      $done();
                                                      return;

                                                    default:
                                                      $done();
                                                      return;
                                                  }
                                                }
                                              };
                                              return $generator.new($continue, false);
                                            })()), $t.fastbox(!$t.syncnullcompare($t.dynamicaccess($t.dynamicaccess($this.state.buildResult, 'GeneratedSourceFile', false), 'IsEmpty', false), function () {
                                              return $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
                                            }).$wrapped, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean)));
                                            $current = 3;
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  })()));
                                  $current = 1;
                                  return;

                                case 1:
                                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Button($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("btn btn-primary", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                    onclick: $t.dynamicaccess($this, 'runProject', false),
                                  }), (function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($t.fastbox("\n\t\t\t\t\tRun\n\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                            $current = 1;
                                            return;

                                          case 1:
                                            $done();
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                  $current = 2;
                                  return;

                                case 2:
                                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("spinner", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                  }), $generator.directempty()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('building', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                  $current = 3;
                                  return;

                                case 3:
                                  $yield($g.pkg.github_com.serulian.virtualdom.HEAD.decorators.If($g.pkg.github_com.serulian.virtualdom.HEAD.vdom.Div($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
                                    className: $t.fastbox("server-error", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
                                  }), (function () {
                                    var $current = 0;
                                    var $continue = function ($yield, $yieldin, $reject, $done) {
                                      while (true) {
                                        switch ($current) {
                                          case 0:
                                            $yield($t.fastbox("\n\t\t\t\t\tA server error occurred. Please try again shortly.\n\t\t\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                                            $current = 1;
                                            return;

                                          case 1:
                                            $done();
                                            return;

                                          default:
                                            $done();
                                            return;
                                        }
                                      }
                                    };
                                    return $generator.new($continue, false);
                                  })()), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$equals($this.state.stateId, $t.fastbox('servererror', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String))));
                                  $current = 4;
                                  return;

                                default:
                                  $done();
                                  return;
                              }
                            }
                          };
                          return $generator.new($continue, false);
                        })()));
                        $current = 7;
                        return;

                      default:
                        $done();
                        return;
                    }
                  }
                };
                return $generator.new($continue, true);
              })());

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
          return this.playgroundBase.StateUpdated.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'shareProject', {
        get: function () {
          return this.playgroundBase.shareProject.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'runProject', {
        get: function () {
          return this.playgroundBase.runProject.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'codeChanged', {
        get: function () {
          return this.playgroundBase.codeChanged.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'updateConsole', {
        get: function () {
          return this.playgroundBase.updateConsole.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'registerConsoleUpdater', {
        get: function () {
          return this.playgroundBase.registerConsoleUpdater.bind(this.playgroundBase);
        },
      });
      Object.defineProperty($instance, 'emitCode', {
        get: function () {
          return this.playgroundBase.emitCode.bind(this.playgroundBase);
        },
      });
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Declare|1|e429e0b7<5cba1fe7>": true,
          "Render|2|e429e0b7<any>": true,
          "StateUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('2fc4f1e3', 'BuildResult', false, '', function () {
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
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer;
      }, false);
      $t.defineStructField($static, 'Output', 'Output', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'GeneratedSourceFile', 'GeneratedSourceFile', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'GeneratedSourceMap', 'GeneratedSourceMap', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<2fc4f1e3>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<2fc4f1e3>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('f3ced3b2', 'playgroundState', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (stateId, currentCode, initialCode, currentView, consoleOutput) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          stateId: stateId,
          currentCode: currentCode,
          initialCode: initialCode,
          currentView: currentView,
          consoleOutput: consoleOutput,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'stateId', 'stateId', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'currentCode', 'currentCode', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'initialCode', 'initialCode', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'buildResult', 'buildResult', function () {
        return $g.playground.BuildResult;
      }, function () {
        return $g.playground.BuildResult;
      }, true);
      $t.defineStructField($static, 'currentView', 'currentView', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'consoleOutput', 'consoleOutput', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'gistInfo', 'gistInfo', function () {
        return $g.playground.gistInfo;
      }, function () {
        return $g.playground.gistInfo;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<f3ced3b2>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<f3ced3b2>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('64afddb7', 'gistFile', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (content) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          content: content,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'content', 'content', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<64afddb7>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<64afddb7>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('5da089f9', 'createGistArgs', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (files, description) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          files: files,
          description: description,
        };
        instance.$markruntimecreated();
        return $static.$initDefaults(instance, true);
      };
      $static.$initDefaults = function (instance, isRuntimeCreated) {
        var boxed = instance[BOXED_DATA_PROPERTY];
        if (isRuntimeCreated || (boxed['public'] === undefined)) {
          instance.public = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
        }
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'files', 'files', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.playground.gistFile);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.playground.gistFile);
      }, false);
      $t.defineStructField($static, 'description', 'description', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'public', 'public', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean;
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<5da089f9>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<5da089f9>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('bf0da5bc', 'gistInfo', false, '', function () {
      var $static = this;
      var $instance = this.prototype;
      $static.new = function (id, html_url, files) {
        var instance = new $static();
        instance[BOXED_DATA_PROPERTY] = {
          id: id,
          "html_url": html_url,
          files: files,
        };
        instance.$markruntimecreated();
        return instance;
      };
      $static.$fields = [];
      $t.defineStructField($static, 'id', 'id', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'html_url', 'html_url', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, false);
      $t.defineStructField($static, 'files', 'files', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.playground.gistFile);
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.playground.gistFile);
      }, false);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<bf0da5bc>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<bf0da5bc>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$struct('0f86869e', 'playgroundAppProps', false, '', function () {
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
      $t.defineStructField($static, 'InitialGistId', 'InitialGistId', function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, function () {
        return $g.pkg.github_com.serulian.corelib.HEAD.primitives.String;
      }, true);
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "Parse|1|e429e0b7<0f86869e>": true,
          "equals|4|e429e0b7<8e6a0ed7>": true,
          "Stringify|2|e429e0b7<4b279881>": true,
          "Mapping|2|e429e0b7<5d7c25c1<any>>": true,
          "Clone|2|e429e0b7<0f86869e>": true,
          "String|2|e429e0b7<4b279881>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    this.$agent('ca308009', 'playgroundBase', false, '', function () {
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
      $instance.shareProject = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var $temp1;
        var $temp2;
        var $temp3;
        var createArgs;
        var info;
        var path;
        var response;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp0 = $this.state.Clone(), $temp0.stateId = $t.fastbox('sharing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
                createArgs = $g.playground.createGistArgs.new($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.playground.gistFile).overObject((function () {
                  var obj = {
                  };
                  obj["entrypoint.seru"] = $g.playground.gistFile.new($this.state.currentCode);
                  return obj;
                })()), $t.fastbox("Serulian shared playground", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                $promise.maybe(createArgs.Stringify($g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON)()).then(function ($result1) {
                  return $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Post($t.fastbox('https://api.github.com/gists', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $result1)).then(function ($result0) {
                    response = $result0;
                    $current = 2;
                    $continue($resolve, $reject);
                    return;
                  });
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
                  continue localasyncloop;
                } else {
                  $current = 6;
                  continue localasyncloop;
                }
                break;

              case 3:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp1 = $this.state.Clone(), $temp1.stateId = $t.fastbox('couldnotshare', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp1))).then(function ($result0) {
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
                continue localasyncloop;

              case 6:
                if ($g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$div(response.StatusCode(), $t.fastbox(100, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)).$wrapped == 2) {
                  $current = 7;
                  continue localasyncloop;
                } else {
                  $current = 13;
                  continue localasyncloop;
                }
                break;

              case 7:
                $promise.maybe($g.playground.gistInfo.Parse($g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON)(response.Text())).then(function ($result0) {
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
                info = $result;
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp2 = $this.state.Clone(), $temp2.gistInfo = info, $temp2.stateId = $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp2))).then(function ($result0) {
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
                path = $t.fastbox($global.location.pathname, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                if (path.HasPrefix($t.fastbox("/p/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) {
                  $current = 10;
                  continue localasyncloop;
                } else {
                  $current = 11;
                  continue localasyncloop;
                }
                break;

              case 10:
                $global.history.replaceState($t.unbox($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).Empty()), "Serulian Playground", $t.unbox($g.pkg.github_com.serulian.corelib.HEAD.primitives.formatTemplateString($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("/p/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.interfaces.Stringable).overArray([$t.fastbox($global.location.origin, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), info.id]))));
                $current = 11;
                continue localasyncloop;

              case 11:
                $current = 12;
                continue localasyncloop;

              case 12:
                $current = 5;
                continue localasyncloop;

              case 13:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp3 = $this.state.Clone(), $temp3.stateId = $t.fastbox('couldnotshare', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp3))).then(function ($result0) {
                  $result = $result0;
                  $current = 14;
                  $continue($resolve, $reject);
                  return;
                }).catch(function (err) {
                  $reject(err);
                  return;
                });
                return;

              case 14:
                $current = 12;
                continue localasyncloop;

              default:
                $resolve();
                return;
            }
          }
        };
        return $promise.new($continue);
      });
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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp0 = $this.state.Clone(), $temp0.buildResult = null, $temp0.currentView = $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0.consoleOutput = $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0.stateId = $t.fastbox('building', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp0))).then(function ($result0) {
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
                $promise.maybe($g.pkg.github_com.serulian.request.HEAD.request.Post($t.fastbox('/play/build', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $this.state.currentCode)).then(function ($result0) {
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
                  continue localasyncloop;
                } else {
                  $current = 6;
                  continue localasyncloop;
                }
                break;

              case 3:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp1 = $this.state.Clone(), $temp1.stateId = $t.fastbox('servererror', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp1.buildResult = null, $temp1.currentView = $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp1))).then(function ($result0) {
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
                continue localasyncloop;

              case 6:
                if (response.StatusCode().$wrapped == 200) {
                  $current = 7;
                  continue localasyncloop;
                } else {
                  $current = 11;
                  continue localasyncloop;
                }
                break;

              case 7:
                $promise.maybe($g.playground.BuildResult.Parse($g.pkg.github_com.serulian.corelib.HEAD.serialization.JSON)(response.Text())).then(function ($result0) {
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
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp2 = $this.state.Clone(), $temp2.stateId = $t.fastbox('editing', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp2.buildResult = result, $temp2.currentView = result.Status.$wrapped == 0 ? $t.fastbox('frame', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String) : $t.fastbox('output', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp2))).then(function ($result0) {
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
                continue localasyncloop;

              case 10:
                $current = 5;
                continue localasyncloop;

              case 11:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp3 = $this.state.Clone(), $temp3.currentView = $t.fastbox('edit', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp3.stateId = $t.fastbox('servererror', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $temp3.buildResult = null, $temp3))).then(function ($result0) {
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
                continue localasyncloop;

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
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp0 = $this.state.Clone(), $temp0.gistInfo = null, $temp0.currentCode = value, $temp0))).then(function ($result0) {
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
      $instance.updateConsole = $t.markpromising(function () {
        var $this = this;
        var $result;
        var $temp0;
        var buffer;
        var $current = 0;
        var $continue = function ($resolve, $reject) {
          localasyncloop: while (true) {
            switch ($current) {
              case 0:
                buffer = $t.syncnullcompare($this.consoleOutputBuffer, function () {
                  return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                });
                $this.consoleOutputBuffer = null;
                $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.UpdateComponentState($this.$principal, ($temp0 = $this.state.Clone(), $temp0.consoleOutput = $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($this.state.consoleOutput, buffer), $t.fastbox('\n', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Trim()), $temp0))).then(function ($result0) {
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
                  continue localasyncloop;
                } else {
                  $current = 4;
                  continue localasyncloop;
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
                continue localasyncloop;

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
          return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        });
        iframeElement = $t.cast(iframeNode, $global.HTMLIFrameElement, false);
        iframeDoc = iframeElement.contentWindow.document;
        scriptTag = iframeDoc.createElement('script');
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.appendChild(iframeDoc.createTextNode($t.unbox(sourceCode)));
        iframeDoc.body.appendChild(scriptTag);
        iframeElement['handler'] = function (value) {
          var message;
          var rootValue;
          var $current = 0;
          syncloop: while (true) {
            switch ($current) {
              case 0:
                message = $t.fastbox('null', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                if (value != null) {
                  $current = 1;
                  continue syncloop;
                } else {
                  $current = 2;
                  continue syncloop;
                }
                break;

              case 1:
                rootValue = $t.unbox(value);
                message = $t.fastbox($t.cast($t.cast($t.dynamicaccess(rootValue, 'toString', false), $g.pkg.github_com.serulian.corelib.HEAD.primitives.functionType($t.any), false)(), $global.String, false), $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                $current = 2;
                continue syncloop;

              case 2:
                $this.consoleOutputBuffer = $g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($g.pkg.github_com.serulian.corelib.HEAD.primitives.String.$plus($t.syncnullcompare($this.consoleOutputBuffer, function () {
                  return $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
                }), message), $t.fastbox('\n', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String));
                $this.registerConsoleUpdater();
                return;

              default:
                return;
            }
          }
        };
        startCode = $t.fastbox("\n\t\t\tvar oldLog = window.console.log;\n\t\t\twindow.console.log = function(msg) {\n\t\t\t\toldLog.apply(this, arguments);\n\t\t\t\twindow.frameElement.handler(msg);\n\t\t\t};\n\n\t\t\twindow.Serulian.then(function(global) {\n\t\t\t\tglobal.playground.Run();\n\t\t\t}).catch(function(e) {\n\t\t\t\tconsole.error(e);\n\t\t\t});\n\t\t", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
        loadScriptTag = iframeDoc.createElement('script');
        loadScriptTag.setAttribute('type', 'text/javascript');
        loadScriptTag.appendChild(iframeDoc.createTextNode($t.unbox(startCode)));
        iframeDoc.body.appendChild(loadScriptTag);
        return;
      };
      this.$typesig = function () {
        if (this.$cachedtypesig) {
          return this.$cachedtypesig;
        }
        var computed = {
          "StateUpdated|2|e429e0b7<void>": true,
        };
        return this.$cachedtypesig = computed;
      };
    });

    $static.Start = $t.markpromising(function (element) {
      var $result;
      var $temp0;
      var gistId;
      var path;
      var $current = 0;
      var $continue = function ($resolve, $reject) {
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              gistId = null;
              path = $t.fastbox($global.location.pathname, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              if (path.HasPrefix($t.fastbox("/p/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).$wrapped) {
                $current = 1;
                continue localasyncloop;
              } else {
                $current = 4;
                continue localasyncloop;
              }
              break;

            case 1:
              gistId = path.$slice($t.fastbox('/p/', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Length(), null);
              if ($t.syncnullcompare($t.dynamicaccess(gistId, 'IsEmpty', false), function () {
                return $t.fastbox(false, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
              }).$wrapped) {
                $current = 2;
                continue localasyncloop;
              } else {
                $current = 3;
                continue localasyncloop;
              }
              break;

            case 2:
              gistId = null;
              $current = 3;
              continue localasyncloop;

            case 3:
              $current = 4;
              continue localasyncloop;

            case 4:
              $promise.maybe($g.playground.PlaygroundApp.Declare(($temp0 = $g.playground.playgroundAppProps.new(), $temp0.InitialGistId = gistId, $temp0))).then(function ($result1) {
                return $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.RenderComponent($result1, element)).then(function ($result0) {
                  $result = $result0;
                  $current = 5;
                  $continue($resolve, $reject);
                  return;
                });
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
        localasyncloop: while (true) {
          switch ($current) {
            case 0:
              elements = $global.document.getElementsByTagName('playgroundeditor');
              $current = 1;
              continue localasyncloop;

            case 1:
              $temp1 = $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer.$range($t.fastbox(0, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer), $t.fastbox(elements.length - 1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer));
              $current = 2;
              continue localasyncloop;

            case 2:
              $temp0 = $temp1.Next();
              i = $temp0.First;
              if ($temp0.Second.$wrapped) {
                $current = 3;
                continue localasyncloop;
              } else {
                $current = 7;
                continue localasyncloop;
              }
              break;

            case 3:
              editorElement = $t.cast(elements[i.$wrapped], $global.Element, false);
              firstChild = editorElement.firstChild;
              initialCode = $t.fastbox('', $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              if (firstChild != null) {
                $current = 4;
                continue localasyncloop;
              } else {
                $current = 5;
                continue localasyncloop;
              }
              break;

            case 4:
              initialCode = $t.fastbox($t.cast(firstChild, $global.Text, false).wholeText, $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
              $current = 5;
              continue localasyncloop;

            case 5:
              editorElement.setAttribute('className', '');
              $promise.maybe($g.pkg.github_com.serulian.component.HEAD.component.RenderComponent($g.playground.PlaygroundEditor.Declare($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).Empty(), initialCode), editorElement)).then(function ($result0) {
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
              continue localasyncloop;

            default:
              $resolve();
              return;
          }
        }
      };
      return $promise.new($continue);
    });
  });
  $module('serulianmode', function () {
    var $static = this;
    $static.buildSerulianAceMode = function () {
      var definition;
      var single_quote;
      single_quote = $t.fastbox("`", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
      definition = $g.pkg.github_com.serulian.corelib.HEAD.native.ESObjectLiteral($g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject({
        Lex: $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject((function () {
          var obj = {
          };
          obj["string"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.struct).overObject((function () {
            var obj = {
            };
            obj["type"] = $t.fastbox("escaped-block", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
            obj["escape"] = $t.fastbox("\\", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($t.struct).overArray([$t.fastbox("RE::/(['\"])/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)]);
            return obj;
          })());
          obj["template_string"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.struct).overObject((function () {
            var obj = {
            };
            obj["type"] = $t.fastbox("escaped-block", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
            obj["escape"] = $t.fastbox("\\", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($t.struct).overArray([$t.fastbox("RE::/([`])/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(1, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Integer)]);
            return obj;
          })());
          obj["operator"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).overObject((function () {
            var obj = {
            };
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("+", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("-", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("%", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("<<", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("*", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("^", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("|", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("&", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("!", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("~", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(">", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("<", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("<=", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(">=", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("!=", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("=", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("==", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("->", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(".", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("?.", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("??", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(":=", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("?", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("&", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
            return obj;
          })());
          obj["atom"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.struct).overObject((function () {
            var obj = {
            };
            obj["autocomplete"] = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("true", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("false", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("any", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("null", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
            return obj;
          })());
          obj["keyword"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.struct).overObject((function () {
            var obj = {
            };
            obj["autocomplete"] = $t.fastbox(true, $g.pkg.github_com.serulian.corelib.HEAD.primitives.Boolean);
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("import", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("from", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("as", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("class", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("interface", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("agent", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("type", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("struct", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("default", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("function", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("property", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("var", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("constructor", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("operator", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("static", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("void", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("get", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("set", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("val", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("this", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("null", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("principal", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("is", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("not", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("in", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("for", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("if", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("else", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("return", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("reject", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("yield", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("break", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("continue", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("with", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("match", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("case", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("switch", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
            return obj;
          })());
          obj["open_brace"] = $t.fastbox("{", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["close_brace"] = $t.fastbox("}", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["delimeter"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).overObject((function () {
            var obj = {
            };
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("(", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox(")", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("[", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("]", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
            return obj;
          })());
          obj["property"] = $t.fastbox("RE::/[_A-Za-z$][_A-Za-z0-9$]*/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["identifier"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("RE::/[0-9a-zA-Z]+/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
          obj["decorator"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("RE::/@[0-9a-zA-Z]+/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
          obj["sml_open_tag"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("RE::/<[0-9a-zA-Z]+ /", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
          obj["sml_close_tag"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("RE::/<\/[0-9a-zA-Z]+>/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
          obj["comment"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.any).overObject((function () {
            var obj = {
            };
            obj["type"] = $t.fastbox("comment", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
            obj["tokens"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($t.any).overArray([$g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($t.any).overArray([$t.fastbox("//", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), null]), $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("/*", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("*/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)])]);
            return obj;
          })());
          obj["number"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("RE::/\\d*\\.\\d+(e[\\+\\-]?\\d+)?/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/\\d+\\.\\d*/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/\\.\\d+/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/0x[0-9a-fA-F]+L?/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/0b[01]+L?/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/0o[0-7]+L?/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/[1-9]\\d*(e[\\+\\-]?\\d+)?L?/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("RE::/0(?![\\dx])/", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
          return obj;
        })()),
        Parser: $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).overArray([$g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("serulian", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)])]),
        RegExpID: $t.fastbox("RE::", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String),
        Style: $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overObject((function () {
          var obj = {
          };
          obj["comment"] = $t.fastbox("comment", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["number"] = $t.fastbox("constant.numeric", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["atom"] = $t.fastbox("constant.language", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["identifier"] = $t.fastbox("identifier", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["keyword"] = $t.fastbox("keyword", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["string"] = $t.fastbox("string", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["template_string"] = $t.fastbox("string", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["operator"] = $t.fastbox("keyword.operator", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["delimeter"] = $t.fastbox("delimeter", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml_attribute"] = $t.fastbox("variable", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml_decorator"] = $t.fastbox("variable.parameter", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml"] = $t.fastbox("support.constant", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          return obj;
        })()),
        Syntax: $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($t.struct).overObject((function () {
          var obj = {
          };
          obj["dot_property"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).overObject((function () {
            var obj = {
            };
            obj["sequence"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox(".", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("property", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
            return obj;
          })());
          obj["null_dot_property"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Mapping($g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String)).overObject((function () {
            var obj = {
            };
            obj["sequence"] = $g.pkg.github_com.serulian.corelib.HEAD.collections.Slice($g.pkg.github_com.serulian.corelib.HEAD.primitives.String).overArray([$t.fastbox("?.", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String), $t.fastbox("property", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String)]);
            return obj;
          })());
          obj["text"] = $t.fastbox("identifier | '!' | '.' | ':'", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml_child"] = $t.fastbox("sml | open_brace serulian+ close_brace | text+", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml_extended_tag"] = $t.fastbox("'>'.sml sml_child*  sml_close_tag.sml", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml_attribute"] = $t.fastbox("(identifier.sml_attribute | decorator.sml_decorator) '='.operator (string|open_brace serulian+ close_brace)", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["sml"] = $t.fastbox("sml_open_tag.sml (sml_attribute)* ('/>'.sml | sml_extended_tag)", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          obj["serulian"] = $t.fastbox("comment | sml | number | atom | keyword | operator | identifier | template_string | string | dot_property | null_dot_property | delimeter", $g.pkg.github_com.serulian.corelib.HEAD.primitives.String);
          return obj;
        })()),
      }));
      return $global.AceGrammar.getMode(definition);
    };
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
})(this);
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