module.exports = (res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify(obj));
  return res.end();
};
