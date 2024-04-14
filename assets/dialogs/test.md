# Vieille femme sur le bord de la route

#intro 

§
setState(produce(state => {
  state.refused = 0;
  state.accepted = false;
}))
setBackground('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/db0c6dad-f868-4ddc-8bf8-c8b851b27293/dg9lk2b-e11fcf08-f20c-499e-b39b-1ce815577953.jpg/v1/fill/w_1182,h_676,q_70,strp/medieval_countryside_with_trees_and_an_old_road_by_daveyai_dg9lk2b-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzMyIiwicGF0aCI6IlwvZlwvZGIwYzZkYWQtZjg2OC00ZGRjLThiZjgtYzhiODUxYjI3MjkzXC9kZzlsazJiLWUxMWZjZjA4LWYyMGMtNDk5ZS1iMzliLTFjZTgxNTU3Nzk1My5qcGciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.OG250mGgWb8QkDztdwiew4LCX5CnQjTP_lXUhaRhTLM')
§

Une vieille femme vous voit approcher tandis que vous marchez sur la route.
Elle vous alpague:

> Bonjour aventurier !
> Approche donc !

---

#quest-proposal

> ${state.refused > 1 ? `Mais sale merde, ca fait ${state.refused} fois que tu refuse en fait !!`: ''}
> ${state.refused ? "Je disais donc..." : ''}
> J'ai une noble quête, veux-tu bien m'aider ?

- ${state.refused ? "Bon d'accord..." : "Mais bien sûr ma bonne dame " }! §next("quest-explaination")§
- ${state.refused ? 'Baaaah...' : 'Franchement ? Non.'}
- ${state.refused ? "NON C'EST NON." : ''} §next("go-away")§

---

§
setState('refused', r => r + 1)
next('quest-proposal')
§

>Mais sac à merde fait un effort un peu ! 

Voilà que la bonne femme commence à s'emporter:

>Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.

--- 

#quest-explaination

>${state.refused > 0 ? "Ah, j'aime mieux ca petit con. Je disais donc." : ''}
>J'ai besoin que tu récupère ma poêle préferée

- J'y vais de ce pas ! §setState('accepted', true)§
- ${state.refused ? 'Non mais non en fait' : 'Ah finalement non'}

---

#go-away

>${!state.accepted && state.refused ? "Mais tu te fous de moi en fait, DÉGAGE !!" : ''}
>${!state.accepted && state.refused <= 0 ? "Oh bon d'accord, c'est dommage..." : ''}
>${ state.accepted ? "Oh merci beaucoup !" : ''}

- MAIS EN FAIT C'ÉTAIT UN RÊVE, tu te reveille devant la vieille !! §next('intro')§

