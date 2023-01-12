const fs = require('fs');
let variables = {};
let funcs = {};
let gval = (a) => variables[a];
let defv = (a, b) => variables[a] = b;
let opcodes = {
    definev: 1,
    print: 2,
    definef: 3,
	writefile: 4,
	readfile: 5,
	callf: 6,
	add: 7,
	sub: 8,
	div: 9,
	mult: 10,
	pow: 11,
	sqrt: 12,
	lshift: 13,
	rshift: 14,
	zrshift: 15
}
for (var t in opcodes) global[t] = opcodes[t];
let runInstrs = (instrs) => {
	let retval = undefined;
    instrs.forEach((code, instrc) => {
        let args = code.slice(1);
        switch (code[0]) {
            case 1:
                defv(args[0], args[1]);
                break;
            case 2:
				let estr = "";
                args.forEach(e => {
					let str = "";
					e.forEach(x => {
						if (!x.length) {
							if (x.variable) {
								str += gval(x.value);
							} else {
								str += x.value;
							}
						} else {
							estr += runInstrs([x])
						}
					});
					estr += str + ' '
				});
				console.log(estr);
                break;
            case 3:
                funcs[args[0]] = args[1];
                break;
			case 4:
				fs.writeFileSync(args[0], args[1]);
				break;
			case 5:
				retval = fs.readFileSync(args[0]).toString();
				break;
			case 6:
				runInstrs(funcs[args[0]])
				break;
			case 7:
				 retval = args[0] + args[1];
			break;
			case 8:
				 retval = args[0] - args[1];
			break;
			case 9:
				 retval = args[0] / args[1];
			break;
			case 10:
				 retval = args[0] * args[1];
			break;
			case 11:
				 retval = args[0] ** args[1];
			break;
			case 12:
				 retval = Math.sqrt(args[0]);
			break;
			case 13:
				 retval = args[0] << args[1];
			break;
			case 14:
				 retval = args[0] >> args[1];
			break;
			case 15:
				 retval = args[0] >>> args[1];
			break;
        }
    })
	return retval;
}
let change_compress = (arr) => {
  return arr.map((x, i) => {
    if (i !== 0) {
      return x - arr[i - 1]
    } else {
      return x;
    }
  })
}
let change_decompress = (arr) => {
  let l_val = arr[0];
  return arr.map((x, i) => {
    if (i !== 0) {
      l_val = l_val + arr[i];
      return l_val;
    } else {
      return x;
    }
  })
}
const getRepeatedChars = (str) => {
  const chars = {};
  for (const char of str) {
    chars[char] = (chars[char] || 0) + 1;
  }
  return Object.entries(chars).map(char => char[1] > 1 ? { name: char[0], value: char[1] } : null).filter(char => char)
}
let ccn_enc = (h) => {
  let str = String.fromCharCode(h[0]) + '';
  for (var t in h[1]) {
    str += t + '' + h[1][t].map(x => String.fromCharCode(x)).join('') + ''
  }
  return str.slice(0, -1);
}
let ccn_dec = (str) => {
  let com = str.split('');
  let len = com[0].charCodeAt();
  let arr = [len];
  let dic = {};
  let objs = com.slice(1).join('').split('');
  objs.forEach(x => {
    let spl = x.split('');
    dic[rev(spl[0])] = spl[1].split('').map(x => x.charCodeAt())
  })
  arr.push(dic);
  return arr;
}
let hexEncode = function(the){
    var hex, i;

    var result = "";
    for (i=0; i<the.length; i++) {
        hex = the.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}
let hexDecode = function(the){
    var j;
    var hexes = the.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}
let rev = (nst) => {
    return hexDecode(hexEncode(nst).split('').reverse().join(''))
}
let strConstructor = (str) => {
  let dups = {};
  str.split('').forEach((x, i) => {
    if (!dups[rev(x)]) {
      dups[rev(x)] = [
        i
      ]
    } else {
      dups[rev(x)].push(i)
    }
  })
  for (var e in dups) {
    dups[e].sort((a, b) => a - b)
    dups[e] = change_compress(dups[e]);
  }
  return ccn_enc([str.length, dups]);
}
let strDeconstructor = (dups) => {
  dups = ccn_dec(dups);
  let str = new Array(dups[0] - 1);
  for (var letter in dups[1]) {
    let l = change_decompress(dups[1][letter]);
    l.forEach(nl => {
      str[nl] = letter;
    });
  }
  return str.join('');
}

let compileInstructions = (instructs) => {
	return strConstructor(JSON.stringify(instructs));
}
let runInstructions = (instructions) => {
	runInstrs(JSON.parse(strDeconstructor(instructions.toString())));
	runInstrs(funcs.main);
}

module.exports = { compileInstructions, runInstructions }
