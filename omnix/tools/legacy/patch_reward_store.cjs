const fs = require('fs');
let content = fs.readFileSync('src/store/rewardStore.ts', 'utf8');

// Undo the sed damage
content = content.replace(/await supabase\.rpc\('secure_claim_mission', \{ p_user_id: user\.id, p_mission_id: missionId, p_reward_coins: mission\.reward_coins \}\);\n\s*\/\/ await supabase\.auth\.updateUser\(\{/g, 'await supabase.auth.updateUser({');

// Now cleanly implement secure claiming
content = content.replace(
  /claimMission:\s*async\s*\(\s*userId,\s*missionId\s*\)\s*=>\s*\{[\s\S]*?return\s*\{ success: true, reward: mission.reward_coins \};\n\s*\}\s*catch\s*\(\s*e:\s*any\s*\)\s*\{/g,
  `claimMission: async (userId, missionId) => {
    try {
      const { missions, missionProgress, coinBalance } = get();
      const mission = missions.find(m => m.id === missionId);
      if (!mission) throw new Error("Mission not found");
      const existingProg = missionProgress[missionId];
      if (existingProg?.claimed) throw new Error("Already claimed");

      // Update state locally
      const newBalance = coinBalance + mission.reward_coins;
      const newProgress = { ...missionProgress, [missionId]: { mission_id: missionId, current_count: mission.target_count, is_completed: true, claimed: true } };
      
      set({ coinBalance: newBalance, missionProgress: newProgress });

      // Save securely via RPC
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Secure server-side validation & reward allocation
        await supabase.rpc('secure_claim_mission', { p_user_id: user.id, p_mission_id: missionId, p_reward_coins: mission.reward_coins });
        
        // Update local metadata just for UI state
        await supabase.auth.updateUser({
          data: { missionProgress: newProgress }
        });
      }

      return { success: true, reward: mission.reward_coins };
    } catch (e: any) {`
);

content = content.replace(
  /purchaseItem:\s*async\s*\(\s*userId,\s*itemId\s*\)\s*=>\s*\{[\s\S]*?return\s*\{ success: true \};\n\s*\}\s*catch\s*\(\s*e:\s*any\s*\)\s*\{/g,
  `purchaseItem: async (userId, itemId) => {
    try {
      const { coinBalance, inventory, shopItems } = get();
      const item = shopItems.find(i => i.id === itemId);
      if (!item) throw new Error("Item not found");
      
      if (coinBalance < item.price) throw new Error("Not enough coins");
      if (inventory.some(i => i.item_id === itemId)) throw new Error("Already owned");

      const newBalance = coinBalance - item.price;
      const newInventory = [...inventory, { id: Date.now().toString(), item_id: itemId, is_equipped: false, shop_items: item }];
      
      set({ coinBalance: newBalance, inventory: newInventory });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Secure server-side validation & deduction
        await supabase.rpc('secure_purchase_item', { p_user_id: user.id, p_item_id: itemId, p_price: item.price });
        
        // Update local metadata
        await supabase.auth.updateUser({
          data: { inventory: newInventory }
        });
      }

      return { success: true };
    } catch (e: any) {`
);

fs.writeFileSync('src/store/rewardStore.ts', content);
