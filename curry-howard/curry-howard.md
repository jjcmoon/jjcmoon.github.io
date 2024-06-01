---
title: "Practical primer to the Curry-Howard correspondence"
date: July 23, 2020
---

The Curry-Howard Isomorphism (CHI) is, in my humble opinion, one of the more fascinating discoveries in computer science. However, it is little known, as introductions are often quite theoretical and founded on terse pre-assumed mathematical knowledge. Practical usage relies on advanced languages with dependent types (like [Idris](https://www.idris-lang.org/) or [Agda](https://wiki.portal.chalmers.se/agda/pmwiki.php)), which in their turn assume some understanding of functional languages like Haskell. All this can pose quite an intimidating barrier for the casual bystander who just wants to dip their toes in the water without getting sucked in into the rapids.

So for these people, I will introduce the CHI with examples in Java, giving a small primer on how it can be used. Of course, the type system of Java is very limiting compared to the functional languages listed above (there's a reason they were made!) but I think it will suffice to demonstrate some of the basic ideas.

# Wait but why?

_The people who like interesting math for its own right and don't care about applications can freely skip this._

So why is this connection between math and code important? Well, when a connection is found between two (seemingly) different fields, this allows you to use tools/tricks from one field on the other one, creating new opportunities. So as a programmer, you can use the power of maths for your programs. A case where this is very useful is verification. Current forms of testing like unit testing allow the creator to eliminate a fair share of bugs, but it does not give complete certainty of the correctness of the code. By using the CHI, it's possible to create mathematical proofs of correctness, giving absolute certainty. (Although this can be difficult or cumbersome to do, but this is something researchers are trying to improve.)

On the other side, mathematicians can leverage computers in their work via the CHI. Using the correspondence, they can encode their proofs in programs. These programs will only compile if the proof is correct. Thus eliminating the risk that there is a subtle error in the proof that nobody noticed. (This is a very real problem for complicated 100-page proofs.)

There is certainly more to be discussed, like what the difficulties are with this verification, or what other applications are, but this would lead us too far.

# The Correspondence

Let's dive in. The CHI was discovered by observing that there is a very deep similarity (an isomorphism, as mathematicians say) between mathematics and programming. It says that, proof systems and type systems are actually the same thing. So when a mathematician states some theorem in a mathematical framework, and a programmer states some type in a programming language, they are fundamentally doing the same thing. Writing a proof for a theorem, corresponds to writing an expression for a type.

| Math | Programming |
|------|------|
| Theorem | Type |
| Proof (for a theorem) | Expression (with a type) |
| Checking if a proof is valid | Type-checking |
| Mathematical framework (e.g. first-order logic) | Type system |

A theorem is true if it has a proof (yes, I will assume soundness and completeness here, but let's not get into the nitty-gritty of that). Using the correspondence: a type is true if you can construct a value with this type. This is called inhabitation: a type is inhabited if you can make a value with this type.

| Math | Programming |
|------|------|
| The theorem is true | The type is inhabited |


# Curry-Howard in Java

So far the CHI might seem very abstract. If every type is a theorem, what does my `List<String>` type mean as a theorem? If every program is a proof, what does my sorting function prove? Similarly, the idea that some types are not inhabited might seem strange for people coming from conventional imperative programming.

It is important here to understand that most mathematics is concerned with "interesting" logics (e.g. first-order logic or dependent logic). But you could as well construct a logic where everything is true. Of course, this would be a boring logic, and not very useful. Similarly, there are type systems that are very boring and not useful (in a mathematical sense), and type systems that are more interesting and expressive (remember, a type system and a logic are the same thing under the CHI). Basically every type system of a mainstream imperative languages are part of the former category: they are pretty boring from a math point of view.

To get back to the original question: observe that in Java every type is inhabited, because of `null`. This means that everything is provable, and hence every type is true. This means the `List<String>` type or whichever other type don't have much meaning. They just are `True`.

But let's pretend that `null` does not exist in Java ([even the creator said that null was a mistake](https://en.wikipedia.org/wiki/Tony_Hoare#Apologies_and_retractions))
Now let's try and use what we learned and construct a simple logic and some proofs in Java. We will start with trueity and falsity. The `True` proposition should always be true, so we can make it a type that is always constructible:

```java
public final class True {
    public True() {}
}
```

Pretty lame, I know. But all beginnings are small. To create a `False`, we need a type that cannot be constructed (barring `null`). I don't know any way to do this in Java: if we don't supply a constructor Java creates a default constructor. (And apparently you can't make an abstract class final.) So let's cheat[^FalseInhabitation] and just use this:

```java
public final class False {
    public False() {
        assert false;
    }
}
```

I'll use asserts when I'm cheating. But know that in practice this would break our proof system, the error should be thrown when type checking and not at run time.

Now to more interesting stuff. How could you create a logical `and`? `A and B` is only true if both A and B are true. So the type for `A and B` must only be constructible if both A and B are constructible. In essence this means `and` is a pair! Indeed, you can only create a pair if you can also make the two arguments.

```java
public final class And<A, B> {

    private A left;
    private B right;

    public And(final A left, final B right) {
        assert left != null && right != null;
        this.left = left;
        this.right = right;
    }

    public A projLeft() {
        return left;
    }

    public B projRight() {
        return right;
    }
}
```

This is the first non-trivial piece of code, so make sure you understand it. There is a single way of construction and two ways to destruct. This is just like in an actual logic, where there would be one derivation rule to create an `and` and two ways to project it.

Next up, the implication. `A => B` is true if, when A is true, B is also true. So B is constructible if A is constructible. This is in essence a function. Indeed, a function can create B, only when given A. This means that our implication will just be wrapper around `Function`.

```java
public final class Imply<A, B> {
    
    private final Function<A, B> function;
    
    public Imply(final Function<A,B> function) {
        assert function != null;
        this.function = function;
    }
    
    public B apply(A t) {
        return function.apply(t);
    }
}
```

# A Proof

With this small toolbox, we are ready to make the first proof. Consider the theorem, `If A and B are true, B is true`. Let's state the theorem in Java:

```java
// Theorem 1: A & B => B
Imply<And<A, B>, B> thm1;
```

In the comment, I stated the exact same thing, but using symbols and infix notation instead of prefix. Initially, it can be helpful to translate the theorem to the programming equivalent in your head (make a function that takes a pair, and returns the second part of the pair). We can do this with:

```java
thm1 = new Imply<>(And::projRight);
```
We simply use one of the two deconstructors, which gives us the proof after wrapping the function in an `Imply`. Next up I'm going to add a little more logic so we can do more interesting proofs.

# More logic

We have two more basic logic constructs left: the `or` and the `not`. Implementing the former, we make `Or<A, B>` constructible by using either a argument of `A` or an argument of `B`. For `And` we needed something that needs both arguments, for `Or` one of them suffices. We can implement this using polymorphism:

```java
public interface Or<A, B> {
    <C> C caseOf(Function<A, C> leftCase, Function<B, C> rightCase);
}


public class OrLeft<A,B> implements Or<A, B> {

    private final A left;

    public OrLeft(A left) {
        this.left = left;
    }

    public <C> C caseOf(Function<A, C> leftCase, Function<B, C> rightCase) {
        return leftCase.apply(left);
    }
}


public class OrRight<A,B> implements Or<A, B>{

    private final B right;

    public OrRight(B right) {
        this.right = right;
    }

    public <C> C caseOf(Function<A, C> leftCase, Function<B, C> rightCase) {
        return rightCase.apply(right);
    }
}
```

Note the symmetry: `Or` has 2 constructors and 1 deconstructor, `And` has 1 constructor and 2 deconstructors. 

Lastly, there is `Not` to discuss. This might be the least intuitive of the bunch (pun not intended), which is why I kept it for last. In effect, `not A` must be provable only if A is not provable. So our implementation `Not<A>` must only be constructible if the type `A` isn't constructible. We can do this by interpreting `not A` as `A => False`. Indeed, we can never construct False on it's own, so if `A => False` exists (it's true), A must be false. Similarly if `A => False` does not exist (it's false), this must be because A is true.

```java
public final class Not<A> {

    private final Function<A, False> proof;

    public Not(final Function<A, False> proof) {
        this.proof = proof;
    }

    public False apply(final A a) {
        return proof.apply(a);
    }
}
```

Now we have all the basic elements of your typical logic. Time to make some more proofs!

# More proofs

Just like any maths, you need to work on it yourself to really understand it. It's a good exercise to try and prove these types before looking at my program. Or even better: state your own theorems, convert them to types and prove them!


```java
// Theorem 2: A | A => A
Function<Or<A, A>, A> thm2;
thm2 = given -> given.caseOf(id_thm, id_thm);
```

So far only one-liners. Proving a [law of De Morgan](https://en.wikipedia.org/wiki/De_Morgan%27s_laws) is a bit more difficult:

```java
// Theorem 3: !x | !y => !(x & y)
Imply<Or<Not<X>, Not<Y>> , Not<And<X, Y>>> thm7;
thm3 = new Imply<>((Or<Not<X>, Not<Y>> x) -> new Not<>(
        ((And<X, Y> y) -> x.caseOf(
                (Not<X> na) -> na.apply(y.projLeft()),
                (Not<Y> nb) -> nb.apply(y.projRight())
        ))
));
```

You'll agree that these proofs get hard to follow very quick (who would have thought that Java was not designed to prove theorems?). Specialized languages for theorem-proving have ways of dealing with this (interactive provers, holes, tactics, etc) but this problem can remain even then.

# Constructive flaws

Try to prove the following theorem: `!(!A) => A`. It seems simple enough, but you'll quickly realize that it can't be done. How come?

Even worse, there many other statements that can't be proven. Famously, the [law of excluded middle](https://en.wikipedia.org/wiki/Law_of_excluded_middle) is not provable in this logic:

```java
// Theorem 2: A | !A
Or<A, Not<A>> thm4;
thm4 = ? // not provable
```

This is because the logic we created is not entirely the same as classic first-order logic (mathematicians call this a [intuitionistic logic](https://en.wikipedia.org/wiki/Intuitionistic_logic)).

Here we are bearing the consequences of the demand to make everything constructible. For example, when you want to make a proof that there is some number X that has a property Y, you need to actually give X. In regular maths, this is not always the case, you sometimes can give an argument that X definitely must exist, without actually showing what it is. Hence constructible logic is weaker than regular logic. Everything that can be proven in constructible logic is provable in regular logic, but not the other way round.

To get back to the law of excluded middle: you could only prove it by giving a program that always decides whether A is true or not. Sadly this is not possible, for example, take A as "[this Turing machine terminates](https://en.wikipedia.org/wiki/Halting_problem)". You know for certain that a Turing machine will either terminate or not, but you cannot generally prove which of the two it will be, and hence you can't give a constructive proof.  

# Idris

So far our examples where not something that could be useful in real life. Sadly Java's type system is too simple for any practical applications. If you are interested in this, I would suggest looking at [Idris](https://www.idris-lang.org/). It's an eager functional programming language, with dependent types. This allows for some very expressive types. You can e.g. define a type of sorted lists, or prime numbers. 

For example, consider an append function that sticks together two lists. In Idris we can demand in the type that the length of the resulting lists is the sum of the lengths of the two input lists.

```haskell
append : Vect n a -> Vect m a -> Vect (n + m) a
```
`Vect` is a list which carries its length in the type. When we implement `append`, the Idris type checker will automatically check if our implementation conforms the type:

```haskell
append Nil       ys = ys
append (x :: xs) ys = x :: append xs ys
```

As a more involved example: [here](https://github.com/davidfstr/idris-insertion-sort) they implement an insertion sort and prove that it will always return a sorted list.

# Footnotes:

[^FalseInhabitation]: This would not be acceptable in a real setting: `new False()` would still type-check. Hence you could prove any false theorem (i.e. the logic isn't sound). Again, this is again a limitation of Java, but we will keep a blind eye to it just like for `null`. There are other similar problems in the content that follows, e.g. for the `Or` you would need to be able to guarantee that you cannot create any other implementation besides `OrLeft` and `OrRight`. And we haven't even considers Java's ability for arbitrary recursion, which also [breaks proof systems](https://en.wikipedia.org/wiki/Curry%27s_paradox#Lambda_calculus).