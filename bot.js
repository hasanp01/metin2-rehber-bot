
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rehberData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

const komut = new SlashCommandBuilder()
  .setName('rehber')
  .setDescription('Metin2 karakter rehberi')
  .addStringOption(option =>
    option.setName('karakter')
      .setDescription('Karakter seç')
      .setRequired(true)
      .addChoices(
        ...Object.keys(rehberData).map(k => ({
          name: k,
          value: k
        }))
      )
  );

client.once('ready', async () => {
  console.log(`🤖 Giriş yapıldı: ${client.user.tag}`);
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    const data = await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: [komut.toJSON()] }
    );
    console.log(`✅ Slash komutu yüklendi: ${data[0].id}`);
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'rehber') {
    const secilen = interaction.options.getString('karakter');
    const karakter = rehberData[secilen];

    if (!karakter) {
      return interaction.reply({ content: "Karakter verisi bulunamadı.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📘 ${secilen} Rehberi`)
      .setColor(0x2f3136)
      .setFooter({ text: "Metin2 Rehber Botu" })
      .setTimestamp();

    if (karakter.ekipman) {
      const ekipman = Object.entries(karakter.ekipman)
        .map(([k, v]) => `**${k}**: ${v}`).join("\n");
      embed.addFields({ name: "🛡️ Ekipman", value: ekipman });
    }

    if (karakter["📈 Statü Sırası"]) {
      embed.addFields({ name: "📈 Statü Sırası", value: karakter["📈 Statü Sırası"].join("\n") });
    }

    if (karakter.efsun) {
      const efsun = Object.entries(karakter.efsun)
        .map(([k, v]) => `**${k}**\n${v.join("\n")}`).join("\n\n");
      embed.addFields({ name: "✨ Efsunlar", value: efsun.slice(0, 1024) });
    }

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
