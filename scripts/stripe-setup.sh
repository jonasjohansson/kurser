#!/usr/bin/env zsh
# Creates the four products, prices and Payment Links in Stripe.
# Usage: scripts/stripe-setup.sh test|live
# Reads STRIPE_TEST_KEY or STRIPE_SECRET_KEY from skynet/.secrets.env. Never prints the key.
set -euo pipefail
MODE=${1:-test}
source ~/GitHub/org/jonasjohansson/skynet/.secrets.env
if [[ $MODE == live ]]; then KEY=${STRIPE_SECRET_KEY:?STRIPE_SECRET_KEY missing}; else KEY=${STRIPE_TEST_KEY:?STRIPE_TEST_KEY missing}; fi
API=https://api.stripe.com/v1
OUT=scripts/stripe-links.$MODE.json
CONTACT="j@jonasjohansson.se"

req() { curl -sS -u "$KEY:" "$@"; }
field() { python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get(sys.argv[1]) if "error" not in d else sys.exit("stripe error: "+d["error"]["message"]))' "$1"; }

# id|course title|date text|time|price SEK|confirmation
SESSIONS=(
  "tuft-2026-11-14|Tuftning|lördag 14 november 2026|12–16|1600|Tack för din bokning! Vi ses lördag 14 november kl 12 hos Klättermusens Verkstad, Nytorgsgatan 36. Ta gärna med ett motiv. Det du tuftat torkar över natten och hämtas i verkstaden söndag 15 november. Frågor: $CONTACT"
  "tuft-2026-11-15|Tuftning|söndag 15 november 2026|12–16|1600|Tack för din bokning! Vi ses söndag 15 november kl 12 hos Klättermusens Verkstad, Nytorgsgatan 36. Ta gärna med ett motiv. Det du tuftat torkar över natten och hämtas i verkstaden måndag 16 november. Frågor: $CONTACT"
  "tov-2027-01-30|Bastuhatt|lördag 30 januari 2027|12–18|2400|Tack för din bokning! Vi ses lördag 30 januari kl 12 hos Klättermusens Verkstad, Nytorgsgatan 36. Fundera på vilken färg du vill ha och kom i kläder som tål vatten och tvål. Frågor: $CONTACT"
  "tov-2027-01-31|Bastuhatt|söndag 31 januari 2027|12–18|2400|Tack för din bokning! Vi ses söndag 31 januari kl 12 hos Klättermusens Verkstad, Nytorgsgatan 36. Fundera på vilken färg du vill ha och kom i kläder som tål vatten och tvål. Frågor: $CONTACT"
)

echo "{" > "$OUT"
first=1
for row in "${SESSIONS[@]}"; do
  IFS='|' read -r id course date time price confirm <<< "$row"
  name="$course, $date"
  desc="$course på Klättermusens Verkstad, Nytorgsgatan 36, Stockholm. $date kl $time. Allt material och fika ingår. Pris inkl. 25 % moms."

  product=$(req $API/products --data-urlencode "name=$name" --data-urlencode "description=$desc" --data-urlencode "metadata[session]=$id" | field id)
  priceId=$(req $API/prices --data-urlencode "product=$product" --data-urlencode "currency=sek" --data-urlencode "unit_amount=$((price*100))" --data-urlencode "tax_behavior=inclusive" | field id)
  link=$(req $API/payment_links \
    --data-urlencode "line_items[0][price]=$priceId" --data-urlencode "line_items[0][quantity]=1" \
    --data-urlencode "line_items[0][adjustable_quantity][enabled]=false" \
    --data-urlencode "restrictions[completed_sessions][limit]=6" \
    --data-urlencode "inactive_message=Det här tillfället är fullbokat. Mejla $CONTACT för väntelista." \
    --data-urlencode "custom_text[submit][message]=Vid avbokning senast sju dagar före kursstart återbetalas kursavgiften med avdrag för den faktiska betalningsavgift som Stripe inte återbetalar. Därefter kan platsen överlåtas. Vid för få anmälningar kan kursen ställas in. Då meddelas alla anmälda och hela kursavgiften återbetalas, utan avdrag för betalningsavgifter." \
    --data-urlencode "phone_number_collection[enabled]=true" \
    --data-urlencode "custom_fields[0][key]=notering" --data-urlencode "custom_fields[0][label][type]=custom" \
    --data-urlencode "custom_fields[0][label][custom]=Något vi bör veta?" --data-urlencode "custom_fields[0][type]=text" --data-urlencode "custom_fields[0][optional]=true" \
    --data-urlencode "after_completion[type]=hosted_confirmation" \
    --data-urlencode "after_completion[hosted_confirmation][custom_message]=$confirm" \
    --data-urlencode "metadata[session]=$id")
  url=$(echo "$link" | field url)
  linkId=$(echo "$link" | field id)
  [[ $first == 1 ]] || echo "," >> "$OUT"; first=0
  printf '  "%s": {"product": "%s", "price": "%s", "payment_link": "%s", "url": "%s"}' "$id" "$product" "$priceId" "$linkId" "$url" >> "$OUT"
  echo "$id -> $url"
done
echo "" >> "$OUT"; echo "}" >> "$OUT"
echo "written $OUT"
