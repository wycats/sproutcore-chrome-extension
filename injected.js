SproutQueryExtension = {};

if (typeof SC !== 'undefined') {
  jQuery(function() {
    var SQ = SproutQueryExtension;

    var NAME_KEY = SC.GUID_KEY + "_name";

    Array.prototype.scDebugString = function() {
      return "[" + this.map(function(i) { return SQ._stringValue(i) }) + "]";
    };

    Function.prototype.scDebugString = function() {
      if (this[NAME_KEY]) {
        return this[NAME_KEY];
      } else if (this.name) {
        return this.name + " (Function)";
      } else {
        return "Anonymous (Function)";
      }
    };

    String.prototype.scDebugString = function() {
      return '"' + this + '"';
    };

    SC.Mixin.prototype.scDebugString = function() {
      if (this.ownerConstructor) {
        return String(this.ownerConstructor);
      } else if (this[NAME_KEY]) {
        return this[NAME_KEY];
      } else {
        return String(this);
      }
    };

    SQ.invoke = function(code) {
      var ret = eval(code);
      return JSON.stringify(ret);
    };

    SQ.properties = function(code) {
      var object = eval(code), ret;

      if (object instanceof SC.Object) {
        ret = SQ._properties(object);
      } else {
        ret = { error: "'" + code + "' did not return an SC.Object" };
      }

      return JSON.stringify(ret);
    };

    SQ._properties = function(object) {
      var meta = SC.meta(object), currentMeta = meta;
      var descriptors, descriptor, type, metaProps, value;
      var ret = [];

      var mixins = SC.Mixin.mixins(object);

      mixins.forEach(function(mixin) {
        ret.push({ name: SQ._stringValue(mixin), properties: SQ._mixinProperties(object, mixin) });
      });

      return ret;
    };

    SQ._mixinProperties = function(object, mixin) {
      var props = {}, value;

      mixin.mixins.forEach(function(mixin) {
        mixinProps = mixin.properties;

        if (!mixinProps) { return; }

        // primitive mixin
        for (var prop in mixinProps) {
          if (!mixinProps.hasOwnProperty(prop)) { continue; }

          value = mixinProps[prop];

          if (typeof value !== 'function') {
            props[prop] = SQ._property(object, prop, value);
          }
        }
      });

      return props;
    };

    SQ._property = function(object, prop, descriptor) {
      if (descriptor instanceof SC.ComputedProperty) {
        type = "computed";
      } else {
        type = "descriptor";
      }

      var value = SC.get(object, prop);
      return { type: type, name: prop, value: SQ._stringValue(value) };
    };

    SQ._stringValue = function(value) {
      if (value && value.scDebugString) {
        return value.scDebugString();
      } else {
        return String(value);
      }
    };
  });
};
