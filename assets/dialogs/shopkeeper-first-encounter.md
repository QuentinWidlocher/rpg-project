# Shopkeeper

§
setCharacter('/characters/shopkeeper.webp')
setBackground('/backgrounds/shop.png')
§

Facing you is a female dwarf with dense, frizzy hairs (including her beard).

She doesn't seem to have noticed you yet, as she's busy organizing shelves and updating her inventory.

- *Feign cough*
- Excuse me ?

---

> OH !

She jumps and quickly turns to face you

> Sorry here ! You surprised me, I was so absorbed in my work I didn't hear you coming in.
> Where you waiting here for a long time ?

- Not at all §setState('waited', false)§
- Actually yes §setState('waited', true)§

---

#questions-about-services

She looks ${state.waited ? 'worried.' : 'relieved'}

> ${state.waited ? 'Oh my gods, sorry for that...' : 'Phew !'}
> Now tell me, what can I do for you ?

- I need to buy supplies §next('buy-explanation')§
- I need to sell stuff §next('sell-explanation')§

---

#buy-explanation

§
console.log('buy-explanation', state)
if (from('sell-explanation')) {
  console.log("from sell-explanation")
  next('after-explanations')
}
§

> ${from('questions-about-services') ? 'Of course !' : 'But you can also buy things.' }
> You can find everything you need here !

She marks ${from('sell-explanation') ? 'another' : 'a'} short pause.

> I mean, *almost* everything haha

---

#sell-explanation

§
console.log('sell-explanation', state)
if (from('questions-about-services')) {
  console.log('from questions-about-services')
  next('buy-explanation')
}
§

> ${from('questions-about-services') ? 'Of course !' : 'But you can also sell me things.' }
> I buy pretty much anything from adventurers.

She marks ${from('buy-explanation') ? 'another' : 'a'} short pause.

> *Almost* everything

She grins.

---

#after-explanations

> Anyway, let me now if you need anything
