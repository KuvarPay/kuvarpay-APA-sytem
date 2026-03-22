# Get FX Rate

### Get FX Rate

| Authorization | Set value to Bearer PUBLIC\_KEY |
| ------------- | ------------------------------- |
| Content-Type  | Set value to `application/json` |

<details>

<summary>BaseUrl</summary>

Sandbox/PROD : <https://api.startbutton.tech&#x20>;

</details>

{% tabs %}
{% tab title="Endpoint" %}
GET `{{baseurl}}/transaction/exchange`
{% endtab %}
{% endtabs %}

#### Sample Response

```json
{
    "success": true,
    "message": "forex",
    "data": [
        {
            "symbol": "GHS",
            "buy": 1x,
            "sell": 8
        },
        {
            "symbol": "NGN",
            "buy": 1xx,
            "sell": 8x
        }
    ]
}
```
