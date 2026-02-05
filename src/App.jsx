import { useState, useEffect } from "react";

export default function Form() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(message);
    setShowForm(false);
  }

  if (!showForm) {
    return (
      <>
        <h1>谢谢使用我们的服务！</h1>
        <button
          onClick={() => {
            setMessage("");
            setShowForm(true);
          }}
        >
          打开聊天
        </button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="消息"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" disabled={message === ""}>
        发送
      </button>
    </form>
  );
}

function sendMessage(message) {
  console.log("发送的消息：" + message);
}
