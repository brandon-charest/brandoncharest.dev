+++
title = "Rust lifetimes"
date = "2025-12-06"
description = "Errors I encounter learning lifetimes and how to resolve them."

[taxonomies]
tags = ["rust"]

[extra]
growth = "growing"
+++

## <'a>

Syntax used to declare and use a lifetime parameter named `'a`

### Zero-Copy Parser Example

```rust
struct Highlight<'a> { // 1. We DECLARE a lifetime generic named 'a
    content: &'a str,  // 2. We USE 'a to tag this specific field
}
```

We can think of 'a kind of like a variable, similar to `x=5`. But instead of a value it holds the **duration of time (scope)**.

1. `<'a>`: We are saying "This struct cannot exist on its own, it is dependent on some data that lives for a duration we call `'a`."
2. `&'a str`: This tells use that this holds a reference to a string, that **must** live at least as long as `'a`.

The `Highlight` struct is essentially signing a contract with the compiler stating
> I, the struct `Highlight`, promise that I will never outlive the data inside `content`. If the string data goes out of scope, I must go out of scope too.

#### Parser Function

```rust
let raw_data = String::from("Header data... IMPORTANT: This is the payload ...footer data");
let highlight = find_important_part(&raw_data);

fn find_important_part<'a>(text:  &'a str) -> Highlight<'a> {
    let parts: Vec<&str> = text.split("IMPORTANT:").collect();
    if parts.len() > 1 {
        // We want the part after "IMPORTANT:"
        Highlight {
            content:  parts[1].trim(),
        }
    } else {
        Highlight { content: "" }
    }
}
```

My initial confusion here was here:

```rust
Highlight {
    content:  parts[1].trim(),
}
```

setting content to `parts[1].trim()` looked like we were just "getting" a lifetime reference from no where, because I had stated the struct Highlight is defined needing `content: &'a str,`. Digging a little deeper I found Rust's [Lifetime Elision](https://doc.rust-lang.org/nomicon/lifetime-elision.html) rules. which means although the `trim()` function in the std written as `pub fn trim(&self) -> &str` is expanded to `fn trim<'b>(&'b self) -> &'b str`. Which satisfy s our definition.

### Variables Sharing Lifetimes

When multiple variables share the same lifetime, Rust will also scope it to the smallest time frame.

#### Longest String Example

```rust
fn longer<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("small");
    let s2 = String::from("longer string");
    println!("Longest: {}", longer(&s1, &s2));
}
```

Here we have an example of both `x` and `y` using the same lifetime `'a`, this code works fine because both `s1` and `s2` live with the `main()` scope, so they both end at the same time. But what if we changed to scope of one of them?

```rust
let s1 = String::from("long lived");
let result;
{
    let s2 = String::from("short");
    // We pass &s1 (long) and &s2 (short) to 'longer'
    // Therefore, 'a becomes the lifespan of s2 (the shorter one)
    result = longer(&s1, &s2);
} // s2 dies here, so 'a ends here.

// even if 'result' actually points to 's1' at runtime!
println!("Result: {}", result);
}
// Error: `s2 does not live long enough
// Error: borrowed value does not live long enough
```

#### Distinct Lifetimes
