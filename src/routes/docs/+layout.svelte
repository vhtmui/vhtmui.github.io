<script>
    /** @type {import('./$types').LayoutData} */
    export let data;
</script>


<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sticky Example</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }
    .header {
      position: sticky;
      top: 0;
      transform: translateY(20px); /* 距离顶部 20px */
      background-color: lightblue;
      padding: 10px;
      text-align: center;
    }
    .content {
      height: 1500px;
      background: linear-gradient(to bottom, #f0f0f0, #ffffff);
    }
  </style>
</head>
<body>
  <div class="header">Sticky Header</div>
  <div class="content">Scroll down to see the sticky header in action.</div>
</body>