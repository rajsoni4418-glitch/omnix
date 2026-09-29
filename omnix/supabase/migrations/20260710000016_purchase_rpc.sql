CREATE OR REPLACE FUNCTION purchase_shop_item(p_user_id uuid, p_item_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item public.shop_items%ROWTYPE;
  v_user_coins bigint;
  v_already_owned boolean;
BEGIN
  -- Check if user is authenticated and matches p_user_id
  IF auth.uid() != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get item details
  SELECT * INTO v_item FROM public.shop_items WHERE id = p_item_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or inactive');
  END IF;

  -- Check if already owned
  SELECT EXISTS(SELECT 1 FROM public.user_inventory WHERE user_id = p_user_id AND item_id = p_item_id) INTO v_already_owned;
  IF v_already_owned THEN
    RETURN json_build_object('success', false, 'error', 'Item already owned');
  END IF;

  -- Get user coins
  SELECT omnix_coins INTO v_user_coins FROM public.profiles WHERE id = p_user_id;
  IF v_user_coins < v_item.price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- Deduct coins
  UPDATE public.profiles SET omnix_coins = omnix_coins - v_item.price WHERE id = p_user_id;

  -- Add to inventory
  INSERT INTO public.user_inventory (user_id, item_id, is_equipped) VALUES (p_user_id, p_item_id, false);

  -- Record transaction
  INSERT INTO public.reward_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (p_user_id, -v_item.price, 'purchase', 'Purchased ' || v_item.title, p_item_id);

  RETURN json_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION equip_shop_item(p_user_id uuid, p_item_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item public.shop_items%ROWTYPE;
  v_inventory public.user_inventory%ROWTYPE;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get inventory and item
  SELECT * INTO v_inventory FROM public.user_inventory WHERE user_id = p_user_id AND item_id = p_item_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Item not in inventory');
  END IF;

  SELECT * INTO v_item FROM public.shop_items WHERE id = p_item_id;

  -- Equip item
  UPDATE public.user_inventory SET is_equipped = true WHERE id = v_inventory.id;

  -- Unequip others of same type
  UPDATE public.user_inventory 
  SET is_equipped = false 
  WHERE user_id = p_user_id 
    AND id != v_inventory.id 
    AND item_id IN (SELECT id FROM public.shop_items WHERE item_type = v_item.item_type);

  -- Update profile with the equipped item based on type
  IF v_item.item_type = 'Profile Frame' THEN
    UPDATE public.profiles SET current_frame = v_item.name WHERE id = p_user_id;
  ELSIF v_item.item_type = 'Premium Badge' THEN
    UPDATE public.profiles SET current_badge = v_item.name WHERE id = p_user_id;
  ELSIF v_item.item_type = 'Username Color' THEN
    UPDATE public.profiles SET username_color = v_item.name WHERE id = p_user_id;
  ELSIF v_item.item_type = 'Premium Theme' THEN
    UPDATE public.profiles SET current_theme = v_item.name WHERE id = p_user_id;
  ELSIF v_item.item_type = 'Story Templates' THEN
    UPDATE public.profiles SET current_story_effect = v_item.name WHERE id = p_user_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION claim_mission_reward(p_user_id uuid, p_mission_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mission public.missions%ROWTYPE;
  v_progress public.user_mission_progress%ROWTYPE;
BEGIN
  IF auth.uid() != p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT * INTO v_mission FROM public.missions WHERE id = p_mission_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Mission not found');
  END IF;

  SELECT * INTO v_progress FROM public.user_mission_progress WHERE user_id = p_user_id AND mission_id = p_mission_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'No progress found');
  END IF;

  IF v_progress.current_count < v_mission.target_count THEN
    RETURN json_build_object('success', false, 'error', 'Mission not completed');
  END IF;

  IF v_progress.claimed THEN
    RETURN json_build_object('success', false, 'error', 'Already claimed');
  END IF;

  -- Mark as claimed
  UPDATE public.user_mission_progress SET claimed = true, is_completed = true WHERE id = v_progress.id;

  -- Add coins
  UPDATE public.profiles SET omnix_coins = omnix_coins + v_mission.reward_coins, experience_points = experience_points + (v_mission.reward_coins / 10) WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.reward_transactions (user_id, amount, transaction_type, description, reference_id)
  VALUES (p_user_id, v_mission.reward_coins, 'mission_reward', 'Completed mission: ' || v_mission.title, p_mission_id);

  RETURN json_build_object('success', true, 'reward', v_mission.reward_coins);
END;
$$;

