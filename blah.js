function square(num) {
    console.log('hi tony');
    return num * num;
}

let x = 0;
let y = square(x) ? square(x) : square(x-1);

if (square(x) === 25 && square(x) > 0) {
    
}